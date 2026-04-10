export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-500">
            Projects
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">
            All projects
          </h1>
        </div>
        <a
          href="/projects/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          New Project
        </a>
      </div>

      <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-900/40 p-10 text-center text-sm text-zinc-400">
        No projects yet. Coming in Block 3.
      </div>
    </div>
  );
}
