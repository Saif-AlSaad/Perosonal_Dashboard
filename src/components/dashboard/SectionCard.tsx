import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, MoreVertical, Edit2, Trash2, GripVertical } from 'lucide-react';
import { Section } from '../../types';
import { DynamicIcon } from '../common/DynamicIcon';

interface SectionCardProps {
  section: Section;
  entryCount: number;
  onClick: () => void;
  onEdit?: (section: Section) => void;
  onDelete?: (section: Section) => void;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetId: string) => void;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  section,
  entryCount,
  onClick,
  onEdit,
  onDelete,
  isDraggable = true,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Subtle tilt: max 5 degrees
    const rY = ((x - centerX) / centerX) * 5;
    const rX = -((y - centerY) / centerY) * 5;

    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setShowMenu(false);
  };

  return (
    <div
      ref={cardRef}
      draggable={isDraggable}
      onDragStart={e => onDragStart && onDragStart(e, section.id)}
      onDragOver={e => onDragOver && onDragOver(e)}
      onDrop={e => onDrop && onDrop(e, section.id)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.4s ease-out',
      }}
      className="group relative cursor-pointer select-none rounded-3xl glass-card p-6 flex flex-col justify-between min-h-[220px] overflow-hidden"
    >
      {/* Dynamic Colored Ambient Glow on Hover */}
      <div
        className="absolute -top-16 -right-16 w-36 h-36 rounded-full blur-2xl transition-opacity duration-500 pointer-events-none opacity-20 group-hover:opacity-60"
        style={{ backgroundColor: section.color || '#6366f1' }}
      />

      {/* Top Header inside Card */}
      <div className="relative z-10 flex items-start justify-between gap-3">
        {/* Section Icon with Color Theme */}
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg transition-transform duration-300 group-hover:scale-105"
          style={{
            backgroundColor: `${section.color}18`,
            borderColor: `${section.color}35`,
            color: section.color || '#ffffff',
          }}
        >
          <DynamicIcon name={section.icon} size={22} className="w-5 h-5" />
        </div>

        {/* Drag Handle & Menu */}
        <div className="flex items-center gap-1">
          {/* Drag Handle Icon */}
          <div
            className="p-1.5 text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing opacity-40 group-hover:opacity-100 transition-opacity"
            title="Drag to reorder"
            onClick={e => e.stopPropagation()}
          >
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Options Menu for Custom or Built-in Sections */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Section options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 z-30 w-36 rounded-xl glass-panel border border-white/10 shadow-xl p-1 backdrop-blur-xl">
                {onEdit && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(section);
                    }}
                    className="w-full px-3 py-2 rounded-lg text-left text-xs text-slate-200 hover:bg-white/10 flex items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Edit Section</span>
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(section);
                    }}
                    className="w-full px-3 py-2 rounded-lg text-left text-xs text-rose-300 hover:bg-rose-500/20 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Delete Section</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Middle: Title & Description */}
      <div className="relative z-10 my-4">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-bold font-display text-white tracking-tight group-hover:text-indigo-200 transition-colors">
            {section.name}
          </h3>
          {section.isCustom && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-white/10 text-slate-300 border border-white/10 uppercase tracking-wider">
              Custom
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed font-sans">
          {section.description}
        </p>
      </div>

      {/* Bottom Footer: Entry Counter & Enter Arrow */}
      <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/5">
        <span className="text-xs font-medium text-slate-400">
          {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
        </span>
        <div className="flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors">
          <span>Open</span>
          <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </div>
  );
};
