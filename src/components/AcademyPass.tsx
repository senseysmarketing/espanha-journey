import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ProgressRing from "./ProgressRing";
import AcademyVideoPlayer from "./AcademyVideoPlayer";
import AcademyTimeline from "./AcademyTimeline";

interface Chapter { title: string; time_seconds: number; }
interface Material { name: string; url: string; }
interface Lesson {
  id: string; module_id: string; title: string; description: string | null;
  video_url: string | null; duration_seconds: number; sort_order: number;
  chapters: Chapter[]; materials: Material[];
}
interface Module {
  id: string; course_id: string; title: string; description: string | null;
  sort_order: number; lessons: Lesson[];
}
interface Course {
  id: string; title: string; description: string | null;
  thumbnail_url: string | null; total_lessons: number; modules: Module[];
}
interface UserProgress {
  lesson_id: string; current_time_seconds: number;
  completed: boolean; completed_at: string | null;
}

const DEMO_COURSES: Course[] = [
  {
    id: "demo-1",
    title: "Imigração Espanha: Do Zero à Residência",
    description: "Guia completo para brasileiros que querem morar na Espanha legalmente.",
    thumbnail_url: null,
    total_lessons: 4,
    modules: [
      {
        id: "mod-1", course_id: "demo-1", title: "Módulo 1 — Planejamento", description: null, sort_order: 0,
        lessons: [
          { id: "les-1", module_id: "mod-1", title: "Bem-vindo ao Academy Pass", description: null, video_url: "https://www.w3schools.com/html/mov_bbb.mp4", duration_seconds: 600, sort_order: 0, chapters: [{ title: "Intro", time_seconds: 0 }, { title: "Visão Geral", time_seconds: 120 }], materials: [{ name: "Checklist PDF", url: "#" }] },
          { id: "les-2", module_id: "mod-1", title: "Tipos de Visto Disponíveis", description: null, video_url: "https://www.w3schools.com/html/mov_bbb.mp4", duration_seconds: 900, sort_order: 1, chapters: [], materials: [] },
        ],
      },
      {
        id: "mod-2", course_id: "demo-1", title: "Módulo 2 — Documentação", description: null, sort_order: 1,
        lessons: [
          { id: "les-3", module_id: "mod-2", title: "Documentos Necessários", description: null, video_url: "https://www.w3schools.com/html/mov_bbb.mp4", duration_seconds: 720, sort_order: 0, chapters: [], materials: [{ name: "Lista de Documentos", url: "#" }] },
          { id: "les-4", module_id: "mod-2", title: "Apostila de Haia", description: null, video_url: "https://www.w3schools.com/html/mov_bbb.mp4", duration_seconds: 480, sort_order: 1, chapters: [], materials: [] },
        ],
      },
    ],
  },
];

const AcademyPass = () => {
  const [courses, setCourses] = useState<Course[]>(DEMO_COURSES);
  const [progress, setProgress] = useState<Map<string, UserProgress>>(new Map());
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // Load courses from Supabase (fallback to demo)
  useEffect(() => {
    const loadData = async () => {
      const { data: coursesData } = await supabase.from("courses").select("*");
      if (!coursesData || coursesData.length === 0) return; // keep demo

      const { data: modulesData } = await supabase.from("modules").select("*").order("sort_order");
      const { data: lessonsData } = await supabase.from("lessons").select("*").order("sort_order");

      if (!modulesData || !lessonsData) return;

      const built: Course[] = coursesData.map((c) => ({
        ...c,
        modules: modulesData
          .filter((m) => m.course_id === c.id)
          .map((m) => ({
            ...m,
            lessons: lessonsData
              .filter((l) => l.module_id === m.id)
              .map((l) => ({ ...l, chapters: (l.chapters || []) as Chapter[], materials: (l.materials || []) as Material[] })),
          })),
      }));
      setCourses(built);
    };
    loadData();
  }, []);

  // Load user progress
  useEffect(() => {
    const loadProgress = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("user_progress").select("*").eq("user_id", user.id);
      if (!data) return;
      const map = new Map<string, UserProgress>();
      data.forEach((p) => map.set(p.lesson_id, p as UserProgress));
      setProgress(map);
    };
    loadProgress();
  }, []);

  const selectedCourse = useMemo(() => courses.find((c) => c.id === selectedCourseId), [courses, selectedCourseId]);

  const allLessons = useMemo(() => {
    if (!selectedCourse) return [];
    return selectedCourse.modules.flatMap((m) => m.lessons);
  }, [selectedCourse]);

  const selectedLesson = useMemo(() => allLessons.find((l) => l.id === selectedLessonId), [allLessons, selectedLessonId]);

  const completedLessons = useMemo(() => {
    const set = new Set<string>();
    progress.forEach((p, id) => { if (p.completed) set.add(id); });
    return set;
  }, [progress]);

  const getCourseProgress = useCallback((course: Course) => {
    const total = course.modules.reduce((a, m) => a + m.lessons.length, 0);
    if (total === 0) return 0;
    const done = course.modules.reduce((a, m) => a + m.lessons.filter((l) => completedLessons.has(l.id)).length, 0);
    return (done / total) * 100;
  }, [completedLessons]);

  const saveProgress = useCallback(async (lessonId: string, currentTimeSec: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("user_progress").upsert({
      user_id: user.id,
      lesson_id: lessonId,
      current_time_seconds: Math.floor(currentTimeSec),
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,lesson_id" });
  }, []);

  const markComplete = useCallback(async (lessonId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("user_progress").upsert({
      user_id: user.id,
      lesson_id: lessonId,
      completed: true,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,lesson_id" });
    setProgress((prev) => {
      const next = new Map(prev);
      next.set(lessonId, { lesson_id: lessonId, current_time_seconds: 0, completed: true, completed_at: new Date().toISOString() });
      return next;
    });
    toast("🎓 Parabéns! Aula concluída!", { description: "Continue assim, você está no caminho certo!" });
  }, []);

  // Lesson view
  if (selectedCourse && selectedLesson) {
    return (
      <div className="bg-academy min-h-screen -mt-20 pt-20">
        <div className="max-w-7xl mx-auto px-4 pb-32">
          {/* Back button */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setSelectedLessonId(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 mt-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar ao curso</span>
          </motion.button>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Player */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1"
            >
              <AcademyVideoPlayer
                videoUrl={selectedLesson.video_url || ""}
                chapters={selectedLesson.chapters}
                initialTime={progress.get(selectedLesson.id)?.current_time_seconds || 0}
                onTimeUpdate={(t) => saveProgress(selectedLesson.id, t)}
                onComplete={() => markComplete(selectedLesson.id)}
              />
              <h2 className="text-xl font-bold text-foreground mt-4">{selectedLesson.title}</h2>
              {selectedLesson.description && (
                <p className="text-sm text-muted-foreground mt-1">{selectedLesson.description}</p>
              )}
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:w-80 glass squircle p-4 max-h-[70vh] overflow-y-auto"
            >
              <AcademyTimeline
                modules={selectedCourse.modules}
                completedLessons={completedLessons}
                currentLessonId={selectedLesson.id}
                onSelectLesson={setSelectedLessonId}
              />
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Course detail view
  if (selectedCourse) {
    return (
      <div className="bg-academy min-h-screen -mt-20 pt-20">
        <div className="max-w-lg mx-auto px-4 pb-32">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setSelectedCourseId(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 mt-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Todos os cursos</span>
          </motion.button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-6">
              <ProgressRing percentage={getCourseProgress(selectedCourse)} size={56} />
              <div>
                <h2 className="text-xl font-bold text-foreground">{selectedCourse.title}</h2>
                <p className="text-sm text-muted-foreground">{selectedCourse.description}</p>
              </div>
            </div>

            <div className="glass squircle p-4">
              <AcademyTimeline
                modules={selectedCourse.modules}
                completedLessons={completedLessons}
                currentLessonId={undefined}
                onSelectLesson={(id) => setSelectedLessonId(id)}
              />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Course listing
  return (
    <div className="bg-academy min-h-screen -mt-20 pt-20">
      <div className="max-w-lg mx-auto px-4 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="glass squircle-xs p-2.5">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Academy Pass</h1>
              <p className="text-sm text-muted-foreground">Seu curso de imigração premium</p>
            </div>
          </div>

          <div className="space-y-4">
            {courses.map((course) => (
              <motion.button
                key={course.id}
                onClick={() => setSelectedCourseId(course.id)}
                className="w-full glass squircle p-5 text-left group"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center gap-4">
                  <ProgressRing percentage={getCourseProgress(course)} size={64} />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{course.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {course.modules.length} módulos · {course.modules.reduce((a, m) => a + m.lessons.length, 0)} aulas
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AcademyPass;
