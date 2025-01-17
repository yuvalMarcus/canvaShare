import {useState} from 'react';
import Box from '@mui/material/Box';
import FlagIcon from '@mui/icons-material/Flag';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import CloseIcon from "@mui/icons-material/Close";
import Typography from '@mui/material/Typography';
import {FormControl, FormControlLabel, Radio, RadioGroup, Stack} from "@mui/material";
import createReport from "../../api/hooks/report/useCreateReport.ts"
import {ReportPayload} from "../../types/report.ts"
import Button from "@mui/material/Button";

const boxStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    p: 4,
};
const listStyle = {
    py: 0,
    width: '100%',
    maxWidth: 500,
    minWidth: 400,
    borderRadius: 2,
    border: '1px solid',
    borderColor: 'divider',
    backgroundColor: 'background.paper',
};

const reports = [
    "Hate and harassment",
    "Nudity and sexual content",
    "Spam",
    "Sharing personal information",
    "Counterfeits and intellectual property",
    "Other"]

export default function ReportModal({type, id}: {type: 'artist' | 'paint', id: number}) {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [value, setValue] = useState('');
    const {mutate: createMutate} = createReport();

    const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue((event.target as HTMLInputElement).value);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const report: ReportPayload = {
            type: type,
            userId: id,
            paintId: id,
            description: value
        };
        createMutate(report);
        handleClose();
    };

    return (<div>
                <IconButton onClick={handleOpen}>
                    <FlagIcon />
                </IconButton>
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description">
                    <Box sx={boxStyle}>
                        <List sx={listStyle}>
                            <Stack flexDirection="row" justifyContent='space-between' p={1}>
                                <Stack flexDirection="row">
                                    <Typography variant="h5">Report</Typography>
                                </Stack>
                                <Stack flexDirection="row-reverse">
                                    <CloseIcon onClick={handleClose} cursor="pointer"/>
                                </Stack>
                            </Stack>
                            <Divider component="li"/>
                            <form onSubmit={handleSubmit}>
                                <FormControl sx={{m: 3}} variant="standard">
                                    <RadioGroup
                                        name="report"
                                        value={value}
                                        onChange={handleRadioChange}
                                    >
                                        {
                                            [...Array(reports.length).keys()].map((i) => (
                                                <FormControlLabel key={i} value={reports[i]} control={<Radio/>} label={reports[i]}/>
                                            ))
                                        }
                                    </RadioGroup>
                                    <Button sx={{mt: 1, mr: 1}} type="submit" variant="outlined">
                                        Submit
                                    </Button>
                                </FormControl>
                            </form>
                        </List>
                    </Box>
                </Modal>
        </div>
    );
}