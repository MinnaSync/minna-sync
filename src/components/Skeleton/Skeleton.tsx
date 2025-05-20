import styles from './Skeleton.module.scss';

type SkeletonProps = {
    className?: string;
    width?: string | number;
    height?: string | number;
    type: 'rect' | 'circle';
    animation: 'pulse' | 'wave';
}

export function Skeleton(props: SkeletonProps & { children?: React.ReactNode }) {
    const { type, animation } = props;

    return (<>
        { type === 'circle' &&
            <div
                className={`${styles.skeletonWrapper} ${styles.circle} ${styles[animation]} ${props.className}`}
                style={{
                    width: props.width,
                    height: props.height,
                }}
            >
                {props.children}
            </div>
        }

        { type === 'rect' &&
            <div
                className={`${styles.skeletonWrapper} ${styles.rect} ${styles[animation]} ${props.className}`}
                style={{
                    width: props.width,
                    height: props.height,
                }}
            >
                {props.children}
            </div>
        }
    </>
    );
}

Skeleton.RowGroup = ({ children }: { children?: React.ReactNode }) => {
    return (<>
        <div className={styles.rowGroup}>
            {children}
        </div>
    </>);
}

Skeleton.ColumnGroup = ({ children }: { children?: React.ReactNode }) => {
    return (<>
        <div className={styles.columnGroup}>
            {children}
        </div>
    </>);
}