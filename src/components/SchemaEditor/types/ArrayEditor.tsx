import { Input } from "../../../components/ui/input.tsx";
import { Label } from "../../../components/ui/label.tsx";
import { Switch } from "../../../components/ui/switch.tsx";
import { getArrayItemsSchema } from "../../../lib/schemaEditor.ts";
import type { ObjectJSONSchema, SchemaType } from "../../../types/jsonSchema.ts";
import { isBooleanSchema, withObjectSchema } from "../../../types/jsonSchema.ts";
import { useState } from "react";
import TypeDropdown from "../TypeDropdown.tsx";
import type { TypeEditorProps } from "../TypeEditor.tsx";
import TypeEditor from "../TypeEditor.tsx";

const ArrayEditor: React.FC<TypeEditorProps> = ({
  schema,
  onChange,
  depth = 0,
}) => {
  const [minItems, setMinItems] = useState<number | undefined>(
    withObjectSchema(schema, (s) => s.minItems, undefined),
  );
  const [maxItems, setMaxItems] = useState<number | undefined>(
    withObjectSchema(schema, (s) => s.maxItems, undefined),
  );
  const [uniqueItems, setUniqueItems] = useState<boolean>(
    withObjectSchema(schema, (s) => s.uniqueItems || false, false),
  );

  // Get the array's item schema
  const itemsSchema = getArrayItemsSchema(schema) || { type: "string" };

  // Get the type of the array items
  const itemType = withObjectSchema(
    itemsSchema,
    (s) => (s.type || "string") as SchemaType,
    "string" as SchemaType,
  );

  // Handle validation settings change
  const handleValidationChange = () => {
    const validationProps: ObjectJSONSchema = {
      type: "array",
      ...(isBooleanSchema(schema) ? {} : schema),
      minItems: minItems,
      maxItems: maxItems,
      uniqueItems: uniqueItems || undefined,
    };

    // Keep the items schema
    if (validationProps.items === undefined && itemsSchema) {
      validationProps.items = itemsSchema;
    }

    // Clean up undefined values
    const propsToKeep: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(validationProps)) {
      if (value !== undefined) {
        propsToKeep[key] = value;
      }
    }

    onChange(propsToKeep as ObjectJSONSchema);
  };

  // Handle item schema changes
  const handleItemSchemaChange = (updatedItemSchema: ObjectJSONSchema) => {
    const updatedSchema: ObjectJSONSchema = {
      type: "array",
      ...(isBooleanSchema(schema) ? {} : schema),
      items: updatedItemSchema,
    };

    onChange(updatedSchema);
  };

  return (
    <div className="space-y-6">
      {/* Array validation settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minItems">Minimum Items</Label>
          <Input
            id="minItems"
            type="number"
            min={0}
            value={minItems ?? ""}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : undefined;
              setMinItems(value);
              // Don't update immediately to avoid too many rerenders
            }}
            onBlur={handleValidationChange}
            placeholder="No minimum"
            className="h-8"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxItems">Maximum Items</Label>
          <Input
            id="maxItems"
            type="number"
            min={0}
            value={maxItems ?? ""}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : undefined;
              setMaxItems(value);
              // Don't update immediately to avoid too many rerenders
            }}
            onBlur={handleValidationChange}
            placeholder="No maximum"
            className="h-8"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="uniqueItems"
          checked={uniqueItems}
          onCheckedChange={(checked) => {
            setUniqueItems(checked);
            setTimeout(handleValidationChange, 0);
          }}
        />
        <Label htmlFor="uniqueItems" className="cursor-pointer">
          Force unique items
        </Label>
      </div>

      {/* Array item type editor */}
      <div className="space-y-2 pt-4 border-t border-border/40">
        <div className="flex items-center justify-between mb-4">
          <Label>Item Type</Label>
          <TypeDropdown
            value={itemType}
            onChange={(newType) => {
              handleItemSchemaChange({
                ...withObjectSchema(itemsSchema, (s) => s, {}),
                type: newType,
              });
            }}
          />
        </div>

        {/* Item schema editor */}
        <TypeEditor
          schema={itemsSchema}
          onChange={handleItemSchemaChange}
          depth={depth + 1}
        />
      </div>
    </div>
  );
};

export default ArrayEditor;
