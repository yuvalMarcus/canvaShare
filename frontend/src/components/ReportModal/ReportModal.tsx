import {FC, useState} from 'react';
import Box from '@mui/material/Box';
import FlagIcon from '@mui/icons-material/Flag';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import CloseIcon from "@mui/icons-material/Close";
import Typography from '@mui/material/Typography';
import {CircularProgress, FormControlLabel, Radio, RadioGroup, Stack} from "@mui/material";
import createReport from "../../api/hooks/report/useCreateReport.ts"
import Button from "@mui/material/Button";
import {grey, red} from "@mui/material/colors";
import {Controller, useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {toast} from "react-toastify";
import {queryClient} from "../../main.tsx";
import {GET_REPORTS} from "../../api/hooks/report/useGetReports.ts";
import {reports, ReportType} from "./ReportModal.config.ts";
import Textarea from "../Form/Textarea/Textarea.tsx";

const schema = z.object({
    option: z.string().min(1, { message: 'Report value is required' }),
    description: z.string().max(80, { message: 'Description value is to mach' }).optional(),
});

interface ReportModalProps {
    type: ReportType;
    paintId?: number;
    userId: number;
}

const ReportModal: FC<ReportModalProps> =({type, paintId, userId}) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const { handleSubmit, control, formState: { errors }, watch } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            report: ''
        }
    });

    const handleOnSuccess = () => {
        setIsOpen(false);
        toast.success("Reported");
        queryClient.invalidateQueries({queryKey: [GET_REPORTS]})
    }

    const handleOnError = () => {
        toast.error("Report failed");
    }

    const { create, isPending } = createReport({ onSuccess:handleOnSuccess, onError: handleOnError });

    const onSubmit = async ({ option, description }) => {
        create({
            type,
            userId,
            paintId,
            description: option === "Other" ? description : option
        });
    }

    const option = watch('option');

    return (
        <>
            <IconButton onClick={() => setIsOpen(true)}>
                <FlagIcon />
            </IconButton>
            <Modal
                open={isOpen}
                onClose={() => setIsOpen(false)}
                aria-labelledby="report-modal-title"
                aria-describedby="report-modal-description">
                <Stack height="100%" alignItems="center" justifyContent="center" onClick={() => setIsOpen(false)}>
                    <Box bgcolor={grey[200]} minWidth={400} onClick={event => event.stopPropagation()}>
                        <Stack flexDirection="row" justifyContent="space-between" alignItems="center" px={2} py={1} borderBottom={1} borderColor={grey[300]}>
                            <Typography variant="h5">Report</Typography>
                            <IconButton onClick={() => setIsOpen(false)}>
                                <CloseIcon />
                            </IconButton>
                        </Stack>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Box p={2}>
                                <Box>
                                    <Controller
                                        control={control}
                                        name="option"
                                        render={({ field }) => (
                                            <RadioGroup {...field}>
                                                {reports.map((value, index) => (
                                                    <FormControlLabel key={index} value={value} control={<Radio />} label={value}/>
                                                ))}
                                            </RadioGroup>
                                        )}
                                    />
                                    <Typography color={red[700]} height={30}>{errors?.report?.message}</Typography>
                                </Box>
                                {option === "Other" && (
                                    <Box>
                                        <Textarea name="description" control={control} label="description" />
                                        <Typography color={red[700]} height={30}>{errors?.description?.message}</Typography>
                                    </Box>
                                )}
                                <Button variant="outlined" fullWidth type="submit" disabled={isPending}>
                                    {isPending && (
                                        <Stack alignItems="center" justifyContent="center">
                                            <CircularProgress size={24}/>
                                        </Stack>
                                    )}
                                    {!isPending && (
                                        <Typography textAlign="center">
                                            submit
                                        </Typography>
                                    )}
                                </Button>
                            </Box>
                        </form>
                    </Box>
                </Stack>
            </Modal>
        </>
    );
}

export default ReportModal;