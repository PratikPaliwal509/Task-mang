function TaskStats({ tasks }) {
  const stats = {
    total: tasks.length,
    open: tasks.filter((t) => t.status === "open").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  }

  return (
    <>
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="text-slate-400 text-sm">Total Tasks</div>
        <div className="text-3xl font-bold text-white mt-2">{stats.total}</div>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="text-slate-400 text-sm">Open</div>
        <div className="text-3xl font-bold text-yellow-400 mt-2">{stats.open}</div>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="text-slate-400 text-sm">In Progress</div>
        <div className="text-3xl font-bold text-blue-400 mt-2">{stats.inProgress}</div>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="text-slate-400 text-sm">Completed</div>
        <div className="text-3xl font-bold text-green-400 mt-2">{stats.done}</div>
      </div>
    </>
  )
}

export default TaskStats
