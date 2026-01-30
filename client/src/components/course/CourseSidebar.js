"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CourseSidebar;
const utils_1 = require("@/lib/utils");
function CourseSidebar({ courseTitle, sections, activeLessonId, onSelectLesson, progress }) {
    const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0);
    const completedCount = Object.values(progress).filter(p => p).length;
    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    return (<div className="w-80 border-r bg-background/50 backdrop-blur-xl flex flex-col h-full shrink-0 shadow-lg">
            <div className="p-6 border-b">
                <h2 className="font-bold text-lg leading-tight line-clamp-2 mb-4">{courseTitle}</h2>
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <span>Course Content</span>
                        <span className="text-primary">{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(var(--primary),0.5)]" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {sections.map((section, index) => (<div key={section.id} className="border-b last:border-0">
                        <div className="bg-muted/30 px-6 py-3">
                            <h3 className="font-bold text-[11px] text-muted-foreground uppercase tracking-[0.1em]">
                                Section {index + 1}: {section.title}
                            </h3>
                        </div>
                        <div className="p-1">
                            {section.lessons.map((lesson) => {
                const isActive = lesson.id === activeLessonId;
                const isCompleted = progress[lesson.id];
                return (<button key={lesson.id} onClick={() => onSelectLesson(lesson.id)} className={(0, utils_1.cn)("w-full flex items-center gap-3 px-5 py-3 text-left transition-all relative group", isActive ? "bg-primary/5 text-primary" : "hover:bg-muted/50 text-foreground/70", isActive && "after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1 after:bg-primary")}>
                                        <div className={(0, utils_1.cn)("h-5 w-5 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300", isCompleted
                        ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20"
                        : "border-muted-foreground/30 group-hover:border-primary/50")}>
                                            {isCompleted ? (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>) : (<div className="w-1 h-1 rounded-full bg-muted-foreground/30 group-hover:bg-primary/50 transition-colors"></div>)}
                                        </div>
                                        <div className={(0, utils_1.cn)("flex-1 text-sm transition-colors", isActive ? "font-semibold" : "font-medium", isCompleted && !isActive && "text-muted-foreground")}>
                                            {lesson.title}
                                        </div>
                                    </button>);
            })}
                        </div>
                    </div>))}
            </div>
        </div>);
}
