import { type Control, Controller } from "react-hook-form"
import TextField from "@mui/material/TextField";

interface InputTextProps {
    name: string;
    control: Control;
    label: string;
}

const InputText = ({ name, control, label }: InputTextProps) => {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value }, fieldState  }) => {
                return (
                    <TextField label={label} variant="outlined" value={value} onChange={onChange} fullWidth error={!!fieldState?.error} />
                )
            }}
        />
    )
}

export default InputText;