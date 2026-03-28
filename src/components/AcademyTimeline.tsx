import { motion } from "framer-motion";
import { Check, Download, Play } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Material {
  name: string;
  url: string;
}

interface Lesson {
  id: string;
  title: string;
  duration_seconds: number;
  materials: Material[];
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface AcademyTimelineProps {
  modules: Module[];
  completedLessons: Set<string>;
  currentLessonId?: string;
  onSelectLesson: (lessonId: string) => void;
}

const AcademyTimeline = ({ modules, completedLessons, currentLessonId, onSelectLesson }: AcademyTimelineProps) => {
  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    return `${m} min`;
  };

  return (
    <div className="space-y-4">
      {modules.map((mod) => (
        <div key={mod.id}>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
            {mod.title}
          </h4>
          <div className="space-y-1">
            {mod.lessons.map((lesson) => {
              const isCompleted = completedLessons.has(lesson.id);
              const isCurrent = currentLessonId === lesson.id;

              return (
                <motion.button
                  key={lesson.id}
                  onClick={() => onSelectLesson(lesson.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left transition-colors ${
                    isCurrent
                      ? "glass border border-primary/30"
                      : "hover:bg-secondary/50"
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Status icon */}
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center glow-complete"
                      >
                        <Check className="w-3.5 h-3.5 text-primary" />
                      </motion.div>
                    ) : (
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        isCurrent ? "bg-primary/20" : "bg-secondary"
                      }`}>
                        <Play className={`w-3 h-3 ${isCurrent ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                    )}
                  </div>

                  {/* Lesson info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${isCurrent ? "text-foreground font-medium" : "text-foreground/80"}`}>
                      {lesson.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDuration(lesson.duration_seconds)}</p>
                  </div>

                  {/* Materials */}
                  {lesson.materials && lesson.materials.length > 0 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="glass squircle-xs w-56 p-3 space-y-2">
                        <p className="text-xs font-semibold text-foreground mb-2">Materiais</p>
                        {lesson.materials.map((mat, i) => (
                          <a
                            key={i}
                            href={mat.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <Download className="w-3 h-3" />
                            {mat.name}
                          </a>
                        ))}
                      </PopoverContent>
                    </Popover>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AcademyTimeline;
