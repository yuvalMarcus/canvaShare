import {AppBar, styled} from "@mui/material";
import {grey} from "@mui/material/colors";
import { Button as MaterialButton } from "@mui/material";

export const Container = styled(AppBar)`
  background-color: ${grey[900]};
`;

export const Button  = styled(MaterialButton)`
  width: fit-content;
  color: ${grey[100]}
`;