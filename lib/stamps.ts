const KEY = "ikseon_stamps";

export function getCompletedCourses(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addCompletedCourse(courseId: string): void {
  if (typeof window === "undefined") return;
  try {
    const completed = getCompletedCourses();
    if (!completed.includes(courseId)) {
      completed.push(courseId);
      localStorage.setItem(KEY, JSON.stringify(completed));
    }
  } catch {}
}
