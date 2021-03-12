type Props = {
  message: string;
  children: JSX.Element;
};

export default function NotFound({ message, children }: Props) {
  return (
    <>
      <h2>¯\_(ツ)_/¯</h2>
      <h3>{message}</h3>
      {children}
    </>
  );
}
