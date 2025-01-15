import {Autocomplete, TextField} from "@mui/material";
import useGetTags from "../../api/hooks/tag/useGetTags.ts";
import {FC} from "react";

interface TagsProps {
    tags: string[];
    onChange: (value: string[]) => void;
}

const Tags: FC<TagsProps> = ({ tags, onChange }) => {

    const { data } = useGetTags();

    return (
        <Autocomplete
            <string[]>
            multiple
            id="tags-outlined"
            options={data?.tags?.map(({ name }) => name) || []}
            defaultValue={tags}
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

export default Tags;