'use client';

import Link from 'next/link';
import { PROBLEMS } from '@/lib/problems-data';

export default function CommonProblems() {
    const slugs = Object.keys(PROBLEMS);

    return (
        <section className="py-16 bg-transparent">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--color-primary-dark)' }}>
                        🔍 Частые проблемы с техникой
                    </h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Разбираем типичные поломки, их причины и стоимость ремонта
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {slugs.map((slug) => {
                        const problem = PROBLEMS[slug];
                        return (
                            <Link
                                key={slug}
                                href={`/problems/${slug}`}
                                className="group block rounded-2xl p-6 bg-white border-2 border-gray-200 hover:border-blue-400 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="text-4xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                                        {problem.icon}
                                    </div>
                                    <div className="min-w-0">
                                        <div
                                            className="inline-block px-2.5 py-0.5 mb-2 text-xs font-semibold rounded-full"
                                            style={{ background: 'var(--color-primary-bg)', color: 'var(--color-primary-dark)' }}
                                        >
                                            {problem.category}
                                        </div>
                                        <h3 className="font-bold text-base mb-1.5 leading-snug" style={{ color: 'var(--color-primary-dark)' }}>
                                            {problem.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {problem.shortAnswer}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
