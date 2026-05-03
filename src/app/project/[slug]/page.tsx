"use client";
import { useProject } from "@/lib/hooks";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProjectPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data } = useProject(slug);
  const router = useRouter();

  useEffect(() => {
    if (data) router.push(`/project/${slug}/chat`);
  }, [data, slug, router]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex gap-2">
        {[0,1,2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-brand-500 typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  );
}
