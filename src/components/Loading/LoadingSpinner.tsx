import styles from './LoadingSpinner.module.scss'

interface SpinnerProps {
    size?: number;
}

export default function LoadingSpinner(props: SpinnerProps) {
    return (
        <svg className={styles.loadingSpinner} width={props.size || '1em'} height={props.size || '1em'} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="20" opacity={0.5}/>
            <circle className={styles.spinner} cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="20" strokeDasharray="100" strokeDashoffset="-60"/>
        </svg>
    );
}