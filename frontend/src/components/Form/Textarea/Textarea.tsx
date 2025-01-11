import { type Control, Controller } from "react-hook-form"
import TextField from "@mui/material/TextField";

interface TextareaProps {
    name: string;
    control: Control;
    label: string;
    defaultValue?: string;
    f_type?: string;
}

const Textarea = ({ name, control, label, defaultValue, f_type}: TextareaProps) => {
    f_type = f_type ? f_type : "text"
    return (
        <Controller
            name={name}
            control={control}
            multiline
            rows={2}
            maxRows={4}
            defaultValue={defaultValue || ''}
            render={({ field: { onChange, value }, fieldState  }) => {
                return (
                    <TextField label={label} variant="outlined" type={f_type} value={value} onChange={onChange} fullWidth error={!!fieldState?.error} />
                )
            }}
        />
    )
}

export default Textarea;