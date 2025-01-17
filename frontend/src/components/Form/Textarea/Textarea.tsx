import { type Control, Controller } from "react-hook-form"
import TextField from "@mui/material/TextField";

interface TextareaProps {
    name: string;
    control: Control;
    label: string;
    defaultValue?: string;
    f_type?: string;
    rows?: number;
}

const Textarea = ({ name, control, label, defaultValue, f_type, rows = 4 }: TextareaProps) => {
    f_type = f_type ? f_type : "text"
    return (
        <Controller
            name={name}
            control={control}
            defaultValue={defaultValue || ''}
            render={({ field: { onChange, value }, fieldState  }) => {
                return (
                    <TextField label={label} multiline={true} variant="outlined" rows={rows} maxRows={4}
                               type={f_type} value={value} onChange={onChange} fullWidth error={!!fieldState?.error} />
                )
            }}
        />
    )
}

export default Textarea;