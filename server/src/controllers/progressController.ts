import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCourseProgress = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Get all completed lessons for this user and course
    // We can query the Progress model directly
    // First, find all lesson IDs belonging to the course to filter specifically if needed, 
    // or just trust the lesson->section->course relation. 
    // Actually, Progress is linked to Lesson. We need to know which of these lessons belong to the course.

    // Efficient way: Find all lessons in this course, then find progress for those lessons.
    const progressRecords = await prisma.progress.findMany({
        where: {
            userId,
            isCompleted: true,
            lesson: {
                section: {
                    courseId
                }
            }
        },
        select: {
            lessonId: true
        }
    });

    const completedLessonIds = progressRecords.map(p => p.lessonId);

    res.status(200).json({
        status: 'success',
        data: {
            completedLessonIds
        }
    });
});

export const updateLessonProgress = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { lessonId } = req.params;
    const userId = req.user.id;
    const { isCompleted } = req.body; // true or false

    const result = await prisma.$transaction(async (tx) => {
        const progress = await tx.progress.upsert({
            where: {
                userId_lessonId: {
                    userId,
                    lessonId
                }
            },
            update: {
                isCompleted,
                updatedAt: new Date()
            },
            create: {
                userId,
                lessonId,
                isCompleted: isCompleted || true
            }
        });

        // Calculate Course Progress
        // 1. Get Course ID from Lesson
        const lesson = await tx.lesson.findUnique({
            where: { id: lessonId },
            include: { section: { select: { courseId: true } } }
        });

        if (lesson) {
            const courseId = lesson.section.courseId;

            // 2. Count total lessons
            const totalLessons = await tx.lesson.count({
                where: { section: { courseId } }
            });

            // 3. Count completed lessons (unique)
            // We need to query Progress items for this course's lessons
            const completedCount = await tx.progress.count({
                where: {
                    userId,
                    isCompleted: true,
                    lesson: { section: { courseId } }
                }
            });

            const percent = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;
            const isCourseCompleted = percent === 100;

            // 4. Update Enrollment
            await tx.enrollment.updateMany({
                where: {
                    userId,
                    courseId
                },
                data: {
                    progress: percent,
                    completed: isCourseCompleted
                }
            });
        }

        return progress;
    });

    // Optional: Calculate overall course progress percentage and update Enrollment
    // We can do this in the background or here.

    res.status(200).json({
        status: 'success',
        data: {
            progress: result
        }
    });
});
