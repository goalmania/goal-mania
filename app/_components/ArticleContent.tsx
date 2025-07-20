import styles from "./ArticleContent.module.css";

interface ArticleContentProps {
  content: string;
  className?: string;
}

export default function ArticleContent({
  content,
  className = "",
}: ArticleContentProps) {
  return (
    <div 
      className={`${styles.articleContent} ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
