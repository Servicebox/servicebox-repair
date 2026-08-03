'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

// Иконка-шеврон вместо текстовых +/- — компактная, вращается при разворачивании
function ChevronIcon({ expanded }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

// Собирает id всех предков activeCategoryId, чтобы сразу раскрыть путь к
// выбранной категории — без этого в дереве глубиной 6 уровней пользователь
// видел бы только корень и должен был бы вручную раскрывать каждый уровень.
function findAncestorIds(tree, activeId) {
  const ancestors = new Set();

  function walk(nodes, path) {
    for (const node of nodes) {
      const nextPath = [...path, node._id];
      if (String(node._id) === activeId) {
        path.forEach((id) => ancestors.add(String(id)));
        return true;
      }
      if (node.children.length > 0 && walk(node.children, nextPath)) return true;
    }
    return false;
  }

  walk(tree, []);
  return ancestors;
}

function CategoryNode({ node, depth, activeCategoryId, expandedIds, onToggle }) {
  const hasChildren = node.children.length > 0;
  const isActive = String(node._id) === activeCategoryId;
  const expanded = expandedIds.has(String(node._id));

  return (
    <li>
      <div className="flex items-center group">
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggle(String(node._id))}
            className="w-6 h-6 flex items-center justify-center text-muted shrink-0 rounded bg-transparent border-0 p-0 hover:bg-primaryBg hover:text-primary transition-colors duration-150 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            aria-label={expanded ? 'Свернуть' : 'Развернуть'}
            aria-expanded={expanded}
          >
            <ChevronIcon expanded={expanded} />
          </button>
        ) : (
          <span className="w-6 shrink-0" />
        )}
        <Link
          href={`/parts/${node.slug}`}
          className={`flex-1 py-1.5 px-2 text-sm rounded-md transition-colors duration-150 truncate ${
            isActive
              ? 'bg-primaryBg text-primary font-semibold border-l-2 border-primary -ml-0.5 pl-[7px]'
              : 'text-text hover:bg-surface hover:text-primary'
          }`}
          title={node.name}
        >
          {node.name}
        </Link>
      </div>
      {hasChildren && expanded && (
        <ul className="ml-3 border-l border-border pl-2 mt-0.5">
          {node.children.map((child) => (
            <CategoryNode
              key={child._id}
              node={child}
              depth={depth + 1}
              activeCategoryId={activeCategoryId}
              expandedIds={expandedIds}
              onToggle={onToggle}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function CategoryTree({ tree, activeCategoryId }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const initialExpanded = useMemo(() => {
    const roots = new Set(tree.map((node) => String(node._id)));
    if (activeCategoryId) {
      const ancestors = findAncestorIds(tree, activeCategoryId);
      ancestors.forEach((id) => roots.add(id));
    }
    return roots;
  }, [tree, activeCategoryId]);

  const [expandedIds, setExpandedIds] = useState(initialExpanded);

  useEffect(() => {
    setExpandedIds(initialExpanded);
  }, [initialExpanded]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const handleKey = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [mobileOpen]);

  const toggle = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const treeList = (
    <ul>
      {tree.map((node) => (
        <CategoryNode
          key={node._id}
          node={node}
          depth={0}
          activeCategoryId={activeCategoryId}
          expandedIds={expandedIds}
          onToggle={toggle}
        />
      ))}
    </ul>
  );

  return (
    <>
      {/* Мобильный триггер */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden w-full mb-4 px-4 py-3 border border-border rounded-xl text-sm font-medium bg-surface shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-transform duration-150"
      >
        <MenuIcon />
        Категории каталога
      </button>

      {/* Мобильная выдвижная панель */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-200 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!mobileOpen}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={() => setMobileOpen(false)} />
        <div
          className={`absolute inset-y-0 left-0 w-4/5 max-w-sm bg-bg shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <span className="font-semibold">Категории каталога</span>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-transparent border-0 p-0 text-text hover:bg-surface transition-colors duration-150 cursor-pointer"
              aria-label="Закрыть"
            >
              <CloseIcon />
            </button>
          </div>
          <div className="p-3 overflow-y-auto">{treeList}</div>
        </div>
      </div>

      {/* Десктопный сайдбар — прилипает при скролле */}
      <nav className="hidden lg:block w-72 shrink-0 self-start sticky top-[116px] max-h-[calc(100vh-140px)] overflow-y-auto bg-surface border border-border rounded-xl shadow-sm p-3">
        {treeList}
      </nav>
    </>
  );
}
