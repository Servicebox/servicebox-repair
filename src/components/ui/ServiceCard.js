'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ServiceCard({ service, onClick, isLink = false, variant = 'default' }) {
    const variants = {
        default: 'bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300',
        compact: 'bg-gray-50 hover:bg-blue-50 border-gray-100 hover:border-blue-200',
        featured: 'bg-gradient-to-br from-blue-90 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-700',
    };

    const content = (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
        relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300
        ${variants[variant]}
      `}
            onClick={onClick}
        >
            <div className="flex items-start gap-4">
                {/* Иконка с градиентом */}
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center text-3xl shadow-lg">
                    {service.icon}
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                        {service.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {service.description}
                    </p>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {service.price && (
                                <span className="text-sm font-semibold text-blue-600">
                                    от {service.price}₽
                                </span>
                            )}
                            {service.time && (
                                <span className="text-xs text-gray-500">
                                    ⏱️ {service.time}
                                </span>
                            )}
                        </div>

                        {service.count && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                {service.count} услуг
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Стрелка */}
            <div className="absolute top-6 right-6 text-gray-400 group-hover:text-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </motion.div>
    );

    if (isLink && service.slug) {
        return (
            <Link href={`/services/${service.slug}`} className="block">
                {content}
            </Link>
        );
    }

    return content;
}