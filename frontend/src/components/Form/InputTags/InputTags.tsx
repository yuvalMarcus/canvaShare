import {Autocomplete, TextField} from "@mui/material";
import useGetTags from "../../../api/hooks/tag/useGetTags.ts";
import {FC} from "react";

interface InputTagsProps {
    tags: string[];
    onChange: (value: string[]) => void;
}

const InputTags: FC<InputTagsProps> = ({ tags, onChange }) => {

    const { data } = useGetTags();

    return (
        <Autocomplete
            <string[]>
            multiple
            id="tags-outlined"
            options={data?.results?.map(({ name }) => name) || []}
            value={tags}
            filterSelectedOptions
            onChange={(_, tags) => onChange(tags || [])}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Tags List"
                    placeholder="Tags"
                />
            )}
        />
    )
}

export default InputTags;