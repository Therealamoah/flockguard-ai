import clsx from 'clsx';

export default function Card({ className, children, as: Tag = 'div', ...rest }) {
  return (
    <Tag
      className={clsx(
        'rounded-2xl border border-border bg-card',
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
