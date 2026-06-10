import styles from "./ArticleContent.module.css";

interface ArticleContentProps {
  content: string;
  className?: string;
  adSlot?: React.ReactNode;
}

export default function ArticleContent({
  content,
  className = "",
  adSlot,
}: ArticleContentProps) {
  if (adSlot) {
    const firstPEnd = content.indexOf("</p>");
    if (firstPEnd !== -1) {
      const before = content.slice(0, firstPEnd + 4);
      const after = content.slice(firstPEnd + 4);
      return (
        <div className={className}>
          <div
            className={styles.articleContent}
            dangerouslySetInnerHTML={{ __html: before }}
          />
          {adSlot}
          <div
            className={styles.articleContent}
            dangerouslySetInnerHTML={{ __html: after }}
          />
        </div>
      );
    }
  }

  return (
    <div
      className={`${styles.articleContent} ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
