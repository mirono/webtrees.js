"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save } from "lucide-react";
import type { Family } from "@/lib/api";
import Link from "next/link";

const eventSchema = z.object({
  id: z.number().optional(),
  event_type: z.string().min(1, "Event type is required"),
  date: z.string().optional(),
  place: z.string().optional(),
  note: z.string().optional(),
});

const familySchema = z.object({
  gedcom_id: z.string().min(1, "ID is required"),
  events: z.array(eventSchema),
  husband_id: z.string().optional(),
  wife_id: z.string().optional(),
});

type FamilyFormData = z.infer<typeof familySchema>;

interface EditFamilyFormProps {
  family: Family;
  onSave?: (data: FamilyFormData) => void;
  onCancel?: () => void;
}

const EVENT_TYPES = [
  { value: "MARR", label: "Marriage" },
  { value: "DIV", label: "Divorce" },
  { value: "ENGA", label: "Engagement" },
  { value: "MARR_LICENSE", label: "Marriage License" },
  { value: "MARR_CONTRACT", label: "Marriage Contract" },
  { value: "MARR_BANN", label: "Marriage Banns" },
];

export default function EditFamilyForm({ family, onSave, onCancel }: EditFamilyFormProps) {
  const { toast } = useToast();
  const form = useForm<FamilyFormData>({
    resolver: zodResolver(familySchema),
    defaultValues: {
      gedcom_id: family.gedcom_id,
      husband_id: family.husband?.gedcom_id || "",
      wife_id: family.wife?.gedcom_id || "",
      events: family.events?.length
        ? family.events
        : [{ event_type: "", date: "", place: "", note: "" }],
    },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const { fields: eventFields, append: appendEvent, remove: removeEvent } =
    useFieldArray({ control, name: "events" });

  const onSubmit = async (data: FamilyFormData) => {
    try {
      onSave?.(data);
      toast({ title: "Saved", description: "Family record updated successfully." });
    } catch {
      toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Family Information</CardTitle>
          <CardDescription>GEDCOM ID: {family.gedcom_id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gedcom_id">GEDCOM ID</Label>
              <Input id="gedcom_id" {...register("gedcom_id")} readOnly className="bg-muted" />
              {errors.gedcom_id && (
                <p className="text-sm text-destructive">{errors.gedcom_id.message}</p>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="husband_id">Husband (GEDCOM ID)</Label>
              <Input
                id="husband_id"
                {...register("husband_id")}
                placeholder="I1"
                list="individuals-list"
              />
              {family.husband && (
                <Link
                  href={`/individuals/${family.husband.gedcom_id}`}
                  className="text-sm text-primary hover:underline"
                >
                  {family.husband.names?.[0]?.full || family.husband.gedcom_id}
                </Link>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="wife_id">Wife (GEDCOM ID)</Label>
              <Input
                id="wife_id"
                {...register("wife_id")}
                placeholder="I2"
                list="individuals-list"
              />
              {family.wife && (
                <Link
                  href={`/individuals/${family.wife.gedcom_id}`}
                  className="text-sm text-primary hover:underline"
                >
                  {family.wife.names?.[0]?.full || family.wife.gedcom_id}
                </Link>
              )}
            </div>
          </div>

          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <Label className="text-sm font-medium text-muted-foreground">Children</Label>
              {family.children && family.children.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {family.children.map((child) => (
                    <li key={child.id}>
                      <Link
                        href={`/individuals/${child.gedcom_id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {child.names?.[0]?.full || child.gedcom_id}
                      </Link>
                      {" "}
                      <span className="text-muted-foreground text-sm">({child.gedcom_id})</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">No children recorded.</p>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Events</CardTitle>
            <CardDescription>Marriage, divorce, and other family events</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendEvent({ event_type: "", date: "", place: "", note: "" })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {eventFields.map((field, index) => (
            <div key={field.id} className="space-y-4 p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Event {index + 1}</span>
                {eventFields.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeEvent(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`events.${index}.event_type`}>Event Type *</Label>
                  <select
                    id={`events.${index}.event_type`}
                    {...register(`events.${index}.event_type`)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select type...</option>
                    {EVENT_TYPES.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  {errors.events?.[index]?.event_type && (
                    <p className="text-sm text-destructive">{errors.events[index]?.event_type?.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`events.${index}.date`}>Date</Label>
                  <Input
                    id={`events.${index}.date`}
                    {...register(`events.${index}.date`)}
                    placeholder="15 Mar 1940 or ABT 1940"
                  />
                </div>
                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor={`events.${index}.place`}>Place</Label>
                  <Input
                    id={`events.${index}.place`}
                    {...register(`events.${index}.place`)}
                    placeholder="London, England"
                  />
                </div>
                <div className="space-y-2 lg:col-span-4">
                  <Label htmlFor={`events.${index}.note`}>Note</Label>
                  <Input
                    id={`events.${index}.note`}
                    {...register(`events.${index}.note`)}
                    placeholder="Optional note..."
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
