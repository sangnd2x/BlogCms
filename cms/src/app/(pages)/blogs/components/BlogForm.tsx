import React, { useState } from "react";
import CustomLabel from "@/components/shared/CustomLabel";
import { Input } from "@/components/ui/input";
import { Control, Controller, FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import RichTextEditor from "@/components/shared/editor/RichTextEditor";
import { BlogFormData } from "@/lib/zod/blogForm";

interface Props {
  register: UseFormRegister<BlogFormData>;
  control: Control<BlogFormData>;
  watch: UseFormWatch<BlogFormData>;
  errors: FieldErrors<BlogFormData>;
  setValue: UseFormSetValue<BlogFormData>;
  categoryOptions: { value: string; label: string }[];
  categoriesLoading: boolean;
  username?: string;
  userId?: string;
  className?: string;
}

const BlogForm: React.FC<Props> = ({
  register,
  control,
  errors,
  watch,
  setValue,
  categoryOptions,
  categoriesLoading,
  username,
  userId,
}) => {
  const [currentTag, setCurrentTag] = useState("");

  const handleAddTag = () => {
    const trimmedTag = currentTag.trim();
    if (!tags.includes(trimmedTag)) {
      setValue("tags", [...tags, trimmedTag], { shouldValidate: true });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      "tags",
      tags.filter(tag => tag !== tagToRemove),
      { shouldValidate: true }
    );
  };

  const tags = watch("tags") || [];

  return (
    <div className="flex flex-col gap-4 border p-4 rounded-lg shadow-sm">
      <p className="font-bold text-2xl">Blog Content</p>

      {/* Title */}
      <div className="flex flex-col gap-2">
        <CustomLabel label="title" />
        <Input {...register("title")} placeholder="Enter blog title..." className="border" />
        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
      </div>

      {/* Category */}
      <div className="flex flex-col gap-2">
        <CustomLabel label="category" isRequired={false} />
        <Controller
          name="category_id"
          control={control}
          render={({ field }) => (
            <Select key={field.value} onValueChange={field.onChange} value={field.value} disabled={categoriesLoading}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Categories</SelectLabel>
                  {categoryOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.category_id && <p className="text-sm text-red-500">{errors.category_id.message}</p>}
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-2">
        <CustomLabel label="tags" isRequired={false} />
        <div className="flex gap-2">
          <Input
            id="tags"
            value={currentTag}
            onChange={e => setCurrentTag(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag();
              }
            }}
            placeholder="Add a tag..."
            className="border"
          />
          <Button type="button" size="icon" variant="outline" onClick={handleAddTag}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-accent text-accent-foreground text-sm"
              >
                {tag}
                <button onClick={() => handleRemoveTag(tag)} className="hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        {errors.tags && <p className="text-sm text-red-500">{errors.tags.message}</p>}
      </div>

      {/* Author */}
      {username ? (
        <div className="flex flex-col gap-2">
          <CustomLabel label="author" isRequired={false} />
          <h2 className="text-secondary-500">{username}</h2>
          <Input value={userId} type="hidden" {...register("author_id")} />
        </div>
      ) : null}

      {/* Content */}
      <div className="flex flex-col gap-2">
        <CustomLabel label="content" />
        <Controller
          name="content"
          control={control}
          render={({ field }) => {
            return <RichTextEditor content={field.value} onChange={field.onChange} />;
          }}
        />
        {errors.content && <p className="text-sm text-red-500">{errors.content.message}</p>}
      </div>
    </div>
  );
};

export default BlogForm;
