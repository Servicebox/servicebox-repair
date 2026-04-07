'use client';

import { useState } from 'react';

const ServiceTree = ({ services, onEdit, onDelete, onCreate, searchTerm }) => {
  return (
    <div className="p-6">
      {services.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg mb-2">Нет услуг или категорий</p>
          <p className="text-sm">Создайте первую категорию чтобы начать</p>
        </div>
      ) : (
        <div className="space-y-2">
          {services.map(service => (
            <TreeNode
              key={service._id}
              service={service}
              onEdit={onEdit}
              onDelete={onDelete}
              onCreate={onCreate}
              searchTerm={searchTerm}
              level={0}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const TreeNode = ({ service, onEdit, onDelete, onCreate, searchTerm, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Filter children by search term
  const filteredChildren = service.children?.filter(child =>
    !searchTerm ||
    child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    child.slug.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const hasFilteredChildren = filteredChildren.length > 0;
  const hasOriginalChildren = service.children && service.children.length > 0;

  const matchesSearch = !searchTerm ||
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.slug.toLowerCase().includes(searchTerm.toLowerCase());

  // If searching and this node doesn't match and has no matching children, don't show
  if (searchTerm && !matchesSearch && !hasFilteredChildren) {
    return null;
  }

  return (
    <div className="select-none">
      {/* Node Content */}
      <div
        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${matchesSearch ? 'bg-white border-gray-200 hover:border-gray-300' : 'bg-gray-50 border-gray-100'
          }`}
        style={{ marginLeft: `${level * 24}px` }}
      >
        {/* Expand/Collapse Button */}
        {hasOriginalChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            <svg
              className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Spacer for nodes without children */}
        {!hasOriginalChildren && <div className="w-6 h-6" />}

        {/* Icon */}
        <div className={`w-12 h-8 rounded-lg flex items-center justify-center ${service.isCategory ? 'bg-blue-100' : 'bg-green-100'
          }`}>
          {service.isCategory ? (
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </div>

        {/* Service Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium truncate ${matchesSearch ? 'text-gray-900' : 'text-gray-500'}`}>
                {service.name}
              </h3>
              {service.description && (
                <p className="text-sm text-gray-500 truncate">
                  {service.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm">
              {!service.isCategory && service.price && (
                <span className="text-green-600 font-medium whitespace-nowrap">
                  {service.price}
                </span>
              )}

              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${service.isCategory
                ? 'bg-blue-100 text-blue-800'
                : 'bg-green-100 text-green-800'
                }`}>
                {service.isCategory ? 'Категория' : 'Услуга'}
              </span>

              <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono hidden sm:block">
                {service.slug}
              </code>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {service.isCategory && (
            <button
              onClick={() => onCreate(service)}
              className="w-12 h-8 flex items-center justify-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              title="Добавить подкатегорию"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}

          <button
            onClick={() => onEdit(service)}
            className="w-12 h-8 flex items-center justify-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            title="Редактировать"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          <button
            onClick={() => onDelete(service.slug)}
            className="w-12 h-8 flex items-center justify-center text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
            title="Удалить"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Children */}
      {hasFilteredChildren && isExpanded && (
        <div className="mt-2 space-y-2">
          {filteredChildren.map(child => (
            <TreeNode
              key={child._id}
              service={child}
              onEdit={onEdit}
              onDelete={onDelete}
              onCreate={onCreate}
              searchTerm={searchTerm}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceTree;