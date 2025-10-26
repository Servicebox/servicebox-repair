///src/app/news/[id]/page.js
import NewsDetail from '../../../components/NewsDetail/NewsDetail';

export async function generateMetadata({ params }) {
  try {
    const response = await fetch(`https://service-box-35.ru/api/news/${params.id}`, {
      next: { revalidate: 60 } // Кэшируем на 60 секунд
    });
    
    if (!response.ok) {
      throw new Error('Новость не найдена');
    }
    
    const data = await response.json();
    
    if (data?.success) {
      return {
        title: `${data.data.title} - ServiceBox Вологда`,
        description: data.data.contentBlocks?.find(block => block.type === 'text')?.content?.substring(0, 160) || 'Новость сервисного центра ServiceBox',
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }
  
  return {
    title: 'Новость - ServiceBox Вологда',
    description: 'Новость сервисного центра ServiceBox',
  };
}

export default function NewsDetailPage({ params }) {
  return <NewsDetail />;
}