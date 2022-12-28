import "./Square.scss";
import { motion } from "framer-motion";

const Square = ({ ind, updateSquaresInServer, clsName, match }) => {
  const handleClick = () => {
    updateSquaresInServer(ind);
  };
  return (
    <motion.div
      disabled={1}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="square"
      onClick={handleClick}
    >
      {clsName && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={clsName}
        ></motion.span>
      )}
    </motion.div>
  );
};

export default Square;
