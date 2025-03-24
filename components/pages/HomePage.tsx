import React from 'react';
import styles from '../../styles/pages/HomePage.module.css';

// Component props
interface HomePageProps {
  title?: string;
  description?: string;
  className?: string;
}

/**
 * HomePage component
 *
 * @param props - Component properties
 * @returns React component
 */
const HomePage: React.FC<HomePageProps> = ({
  title = 'Designed For You',
  description = 'Professional web development and design services',
  className = '',
}) => {
  return (
    <div className={`${styles.root} ${styles.container} ${className}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
      </div>
      <div className={styles.content}>{/* Content goes here */}</div>
    </div>
  );
};

export default HomePage;
