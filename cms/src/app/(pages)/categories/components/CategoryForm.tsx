import { register } from "module";
import { UseFormRegister, Control, UseFormWatch, FieldErrors, UseFormSetValue, Controller } from "react-hook-form";
import CustomLabel from "../../../../components/shared/CustomLabel";
import { Input } from "../../../../components/ui/input";
import { CategoryFormData } from "../../../../lib/zod/categoryForm";
import { HexColorPicker } from "react-colorful";
import CustomTag from "../../../../components/shared/CustomTag";

interface Props {
  register: UseFormRegister<CategoryFormData>;
  control: Control<CategoryFormData>;
  watch: UseFormWatch<CategoryFormData>;
  errors: FieldErrors<CategoryFormData>;
  setValue: UseFormSetValue<CategoryFormData>;
}

const CategoryForm: React.FC<Props> = ({ register, control, watch, errors, setValue }) => {
  const name = watch("name");
  const description = watch("description");
  const color = watch("color");

  console.log("name", name);
  console.log("description", description);
  console.log("color", color);

  return (
    <div className="flex gap-4 ">
      <div className="flex flex-col gap-4 flex-1 border p-4 rounded-lg shadow-sm">
        {/* category name */}
        <div className="flex flex-col gap-2">
          <CustomLabel label="name" />
          <Input {...register("name")} placeholder="Enter category name..." className="border" />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>

        {/* category description */}
        <div className="flex flex-col gap-2">
          <CustomLabel label="description" isRequired={false} />
          <Input {...register("description")} placeholder="Enter category description..." className="border" />
          {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-8">
            <CustomLabel label="color" isRequired={false} />
            <p className="text-sm font-mono">{color}</p>
          </div>
          <div className="mt-12">
            <Controller
              name="color"
              control={control}
              render={({ field }) => {
                return <HexColorPicker color={field.value} onChange={field.onChange} />;
              }}
            />
          </div>
          {errors.color && <p className="text-sm text-red-500">{errors.color.message}</p>}
        </div>
      </div>
      <div className="flex-1 border p-4 rounded-lg shadow-sm flex flex-col">
        <h1 className="text-4xl font-bold mb-4">Preview Tag</h1> {/* Added: mb-4 */}
        <div className="flex items-center justify-center flex-1">
          <div className="scale-350">
            <CustomTag color={color} label={name} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryForm;
