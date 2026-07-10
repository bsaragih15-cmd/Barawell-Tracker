import { notFound } from 'next/navigation';
import { QuizEngine, type QuizCategory } from './QuizEngine';

export const dynamic = 'force-dynamic';

const CATS = ['berat-badan', 'pil-kb', 'kulit', 'rambut', 'cemas', 'tidur'] as const;

export default function QuizPage({ params }: { params: { cat: string } }) {
  if (!CATS.includes(params.cat as (typeof CATS)[number])) notFound();
  return <QuizEngine category={params.cat as QuizCategory} />;
}
