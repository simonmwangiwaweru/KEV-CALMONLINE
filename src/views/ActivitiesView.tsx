import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ActivityTask, TaskPriority, TaskStatus } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  Plus, 
  Trash2 
} from 'lucide-react';

export const ActivitiesView: React.FC = () => {
  const { activities, addTask, updateTaskStatus, deleteTask, jobs } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'pending' | 'completed'>('today');
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  // New task form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [relatedJobId, setRelatedJobId] = useState('');
  const [notes, setNotes] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTasks = activities.filter((t) => {
    if (activeFilter === 'today') return t.date === todayStr;
    if (activeFilter === 'pending') return t.status !== 'completed';
    if (activeFilter === 'completed') return t.status === 'completed';
    return true;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedJob = jobs.find(j => j.id === relatedJobId);

    addTask({
      title: title.trim(),
      date,
      time,
      priority,
      status: 'pending',
      relatedJobId: relatedJobId || undefined,
      relatedName: selectedJob?.serviceName || undefined,
      notes: notes.trim() || undefined
    });

    setTitle('');
    setNotes('');
    setIsNewTaskOpen(false);
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="t-group text-[var(--ok)]">
              Operations & Schedule
            </span>
            <span className="text-[var(--text-3)]">·</span>
            <span className="t-caption">Client Deadlines & Tasks</span>
          </div>
          <h2 className="t-title text-xl font-bold mt-0.5">
            Activity & Task Management
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewTaskOpen(true)}
            className="px-4 py-2 glass glass--pill is-active text-[var(--text)] font-semibold text-xs border border-white/60 shadow-[var(--glow)] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2]" />
            New Activity / Task
          </button>
        </div>
      </div>

      {/* Filter Segmented Control */}
      <div className="flex items-center gap-1 p-1 glass glass--pill w-fit overflow-x-auto">
        {[
          { id: 'today', label: "Today's Focus" },
          { id: 'pending', label: 'All Pending Tasks' },
          { id: 'completed', label: 'Completed' },
          { id: 'all', label: 'All Schedule' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === tab.id
                ? 'glass glass--pill is-active text-[var(--text)] shadow-[var(--glow)]'
                : 'text-[var(--text-2)] hover:text-[var(--text)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 text-center glass t-caption">
          No tasks found for this view. Click "New Activity / Task" to schedule your day.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 glass glass--tile transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[var(--glass-shadow)] ${
                task.status === 'completed' ? 'opacity-70' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => updateTaskStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                  className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                    task.status === 'completed'
                      ? 'bg-[var(--glass-active)] border-white/80 text-[var(--text)] shadow-[var(--glow)]'
                      : 'border-white/40 hover:border-white/80 bg-white/10 text-transparent'
                  }`}
                >
                  {task.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-[var(--ok)] stroke-[2.5]" />}
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-semibold ${task.status === 'completed' ? 'line-through text-[var(--text-3)]' : 'text-[var(--text)]'}`}>
                      {task.title}
                    </span>
                    <span className="text-[var(--text-3)]">·</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 glass glass--pill capitalize font-medium ${
                      task.priority === 'high' ? 'text-[var(--alert)] bg-[var(--alert)]/15 border-[var(--alert)]/40' :
                      task.priority === 'medium' ? 'text-[var(--pending)] bg-[var(--pending)]/15 border-[var(--pending)]/40' : 'text-[var(--text-2)]'
                    }`}>
                      {task.priority}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[var(--text-2)]">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-[var(--text-3)]" strokeWidth={1.5} />
                      {task.date} {task.time ? `at ${task.time}` : ''}
                    </span>
                    {task.relatedName && (
                      <>
                        <span>·</span>
                        <span className="text-[var(--text)] font-semibold">{task.relatedName}</span>
                      </>
                    )}
                    {task.notes && (
                      <>
                        <span>·</span>
                        <span className="t-caption text-left truncate max-w-xs">{task.notes}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <select
                  value={task.status}
                  onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                  className="px-2.5 py-1 text-xs glass glass--pill border border-white/40 text-[var(--text)] focus:outline-none cursor-pointer"
                >
                  <option value="pending" className="bg-[#5f8a68] text-white">Pending</option>
                  <option value="in_progress" className="bg-[#5f8a68] text-white">In Progress</option>
                  <option value="completed" className="bg-[#5f8a68] text-white">Completed</option>
                </select>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="icon-btn"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5 text-[var(--text-3)]" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Task Modal */}
      {isNewTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-modal p-6 space-y-4 shadow-[var(--glass-shadow)] animate-modal-enter">
            <h3 className="t-title text-base font-semibold">Create Activity / Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block t-label mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Export final wedding teaser, Drone battery check"
                  className="w-full px-3 py-2 glass-input text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block t-label mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 glass-input text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block t-label mb-1">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 glass-input text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block t-label mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 glass-input text-sm"
                  >
                    <option value="high" className="bg-[#5f8a68] text-white">High</option>
                    <option value="medium" className="bg-[#5f8a68] text-white">Medium</option>
                    <option value="low" className="bg-[#5f8a68] text-white">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block t-label mb-1">Link to Job</label>
                  <select
                    value={relatedJobId}
                    onChange={(e) => setRelatedJobId(e.target.value)}
                    className="w-full px-3 py-2 glass-input text-sm"
                  >
                    <option value="" className="bg-[#5f8a68] text-white">-- None --</option>
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id} className="bg-[#5f8a68] text-white">{j.serviceName} ({j.clientName})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block t-label mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Bring extra batteries"
                  className="w-full px-3 py-2 glass-input text-sm"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTaskOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-[var(--text-2)] hover:text-[var(--text)] glass glass--pill font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 glass glass--pill is-active text-[var(--text)] font-semibold text-xs border border-white/60 shadow-[var(--glow)]"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
