'use client';
import { useState } from 'react';
import Link from 'next/link';

function CategoryNode({ node, depth, activeCategoryId }) {
  const [expanded, setExpanded] = useState(depth === 0);
  const hasChildren = node.children.length > 0;
  const isActive = String(node._id) === activeCategoryId;

  return (
    <li>
      <div className="flex items-center">
        {hasChildren && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="w-5 h-5 flex items-center justify-center text-muted shrink-0"
            aria-label={expanded ? 'Свернуть' : 'Развернуть'}
          >
            {expanded ? '−' : '+'}
          </button>
        )}
        <Link
          href={`/parts/${node.slug}`}
          className={`flex-1 py-1.5 px-1 text-sm rounded ${isActive ? 'font-semibold text-primary' : 'hover:text-primary'}`}
          style={{ marginLeft: hasChildren ? 0 : 20 }}
        >
          {node.name}
        </Link>
      </div>
      {hasChildren && expanded && (
        <ul className="ml-4 border-l pl-2">
          {node.children.map((child) => (
            <CategoryNode key={child._id} node={child} depth={depth + 1} activeCategoryId={activeCategoryId} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function CategoryTree({ tree, activeCategoryId }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden w-full mb-4 px-4 py-2 border rounded-lg text-sm font-medium"
      >
        📂 Категории
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div
            className="bg-bg h-full w-4/5 max-w-sm p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={() => setMobileOpen(false)} className="mb-4 text-muted">
              ✕ Закрыть
            </button>
            <ul>
              {tree.map((node) => (
                <CategoryNode key={node._id} node={node} depth={0} activeCategoryId={activeCategoryId} />
              ))}
            </ul>
          </div>
        </div>
      )}

      <nav className="hidden lg:block w-64 shrink-0">
        <ul>
          {tree.map((node) => (
            <CategoryNode key={node._id} node={node} depth={0} activeCategoryId={activeCategoryId} />
          ))}
        </ul>
      </nav>
    </>
  );
}
