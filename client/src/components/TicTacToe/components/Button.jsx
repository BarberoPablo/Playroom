const Button = ({ onClick, display }) => {
  return <button onClick={() => onClick()}>{display}</button>;
};

export default Button;
