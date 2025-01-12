import {Stack, styled} from "@mui/material";
import Card from "@mui/material/Card";

export const Controller = styled(Card)`
  width: calc(25% - 16px);
  cursor: pointer;
`;

export const CardController = styled(Stack)<{ photo: string }>`
  background: url(${({photo}) => photo});
  background-size: cover;
  background-position: 50% 50%;
  aspect-ratio: 1.2;
`;