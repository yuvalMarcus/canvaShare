import { type Control, Controller } from "react-hook-form"
import TextField from "@mui/material/TextField";

interface InputTextProps {
    name: string;
    control: Control;
    label: string;
    f_type?: string;
}

const InputText = ({ name, control, label, f_type}: InputTextProps) => {
    f_type = f_type ? f_type : "text"
    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value }, fieldState  }) => {
                return (
                    <TextField label={label} variant="outlined" type={f_type} value={value} onChange={onChange} fullWidth error={!!fieldState?.error} />
                )
            }}
        />
    )
}

export default InputText;