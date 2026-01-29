import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get Quiz for a Lesson (Student/Instructor)
export const getQuiz = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { lessonId } = req.params;

    const quiz = await prisma.quiz.findUnique({
        where: { lessonId },
        include: {
            questions: {
                select: {
                    id: true,
                    text: true,
                    options: true,
                    // Don't reveal correct details to student immediately if we don't want to?
                    // But usually we need them for client-side evaluation OR backend evaluation.
                    // Let's do backend evaluation for security, so don't send correctOptionIndex to student by default?
                    // For now, let's send it if user is instructor, or maybe just rely on backend submit.
                }
            }
        }
    });

    // If user is instructor (not implemented strictly here without looking up course ownership, 
    // but assuming this is a general fetch. To hide answers, we should filter).
    // For simplicity in this iteration, let's send questions.
    // Ideally, we shouldn't send 'correctOptionIndex' to students.

    // Let's protect sensitive data if needed.
    // const isInstructor = ...

    res.status(200).json({
        status: 'success',
        data: {
            quiz
        }
    });
});

// Create or Update Quiz (Instructor)
export const manageQuiz = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { lessonId } = req.params;
    const { questions } = req.body; // Expects array of questions

    // Check ownership
    const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { section: { include: { course: true } } }
    });

    if (!lesson) return next(new AppError('Lesson not found', 404));

    if (lesson.section.course.instructorId !== req.user.id && req.user.role !== 'ADMIN') {
        return next(new AppError('Not authorized to manage this quiz', 403));
    }

    // Upsert Quiz
    // We will delete existing questions and recreate them for simplicity in this "Save" operation
    // Or use transaction.

    const quiz = await prisma.$transaction(async (tx) => {
        // 1. Find or create quiz
        let q = await tx.quiz.findUnique({ where: { lessonId } });
        if (!q) {
            q = await tx.quiz.create({
                data: { lessonId }
            });
        }

        // 2. Delete old questions
        await tx.question.deleteMany({
            where: { quizId: q.id }
        });

        // 3. Create new questions
        // questions body: [{ text, options: string[], correctOptionIndex: number, correctDetails: string }]
        if (questions && questions.length > 0) {
            await tx.question.createMany({
                data: questions.map((qData: any) => ({
                    quizId: q!.id,
                    text: qData.text,
                    options: qData.options, // Prisma handles string[] for Postgres
                    correctOptionIndex: qData.correctOptionIndex,
                    correctDetails: qData.correctDetails
                }))
            });
        }

        return tx.quiz.findUnique({
            where: { id: q.id },
            include: { questions: true }
        });
    });

    res.status(200).json({
        status: 'success',
        data: {
            quiz
        }
    });
});

// Submit Quiz Attempt (Student)
export const submitQuiz = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { quizId } = req.params;
    const { answers } = req.body; // { questionId: selectedIndex }
    const userId = req.user.id;

    const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: { questions: true }
    });

    if (!quiz) return next(new AppError('Quiz not found', 404));

    // Calculate Score
    let correctCount = 0;
    const totalQuestions = quiz.questions.length;

    quiz.questions.forEach(q => {
        const userAns = answers[q.id];
        if (userAns !== undefined && userAns === q.correctOptionIndex) {
            correctCount++;
        }
    });

    const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const passed = score >= 80; // Hardcoded 80% passing

    // Record Attempt
    const attempt = await prisma.quizAttempt.create({
        data: {
            quizId,
            userId,
            score,
            passed
        }
    });

    // If passed, maybe mark lesson as complete?
    if (passed) {
        await prisma.progress.upsert({
            where: {
                userId_lessonId: {
                    userId,
                    lessonId: quiz.lessonId
                }
            },
            update: { isCompleted: true },
            create: {
                userId,
                lessonId: quiz.lessonId,
                isCompleted: true
            }
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            attempt,
            correctCount,
            totalQuestions,
            passed
        }
    });
});
