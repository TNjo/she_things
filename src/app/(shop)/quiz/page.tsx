import { db } from "@/lib/db";
import Quiz from "@/components/quiz/Quiz";

export const metadata = { title: "What's your jewel personality?" };
export const dynamic = "force-dynamic";

export default async function QuizPage() {
  const products = await db.products.list();
  return <Quiz products={products} />;
}
