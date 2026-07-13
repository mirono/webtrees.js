"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save } from "lucide-react";
import type { Individual } from "@/lib/api";

const nameSchema = z.object({
  id: z.number().optional(),
  full: z.string().min(1, "Name is required"),
  given: z.string().optional(),
  surname: z.string().optional(),
  type: z.string().optional(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
});

const eventSchema = z.object({
  id: z.number().optional(),
  event_type: z.string().min(1, "Event type is required"),
  date: z.string().optional(),
  place: z.string().optional(),
  note: z.string().optional(),
});

const individualSchema = z.object({
  gedcom_id: z.string().min(1, "ID is required"),
  sex: z.string().regex(/^[MFO]$/, "Sex must be M, F, or O").optional(),
  names: z.array(nameSchema),
  events: z.array(eventSchema),
});

type IndividualFormData = z.infer<typeof individualSchema>;

interface EditIndividualFormProps {
  individual: Individual;
  onSave?: (data: IndividualFormData) => void;
  onCancel?: () => void;
}

const EVENT_TYPES = [
  { value: "BIRT", label: "Birth" },
  { value: "DEAT", label: "Death" },
  { value: "MARR", label: "Marriage" },
  { value: "DIV", label: "Divorce" },
  { value: "BURI", label: "Burial" },
  { value: "CENS", label: "Census" },
  { value: "OCCU", label: "Occupation" },
  { value: "RESI", label: "Residence" },
  { value: "CHR", label: "Christening" },
  { value: "BAPM", label: "Baptism" },
  { value: "EDUC", label: "Education" },
  { value: "RELI", label: "Religion" },
];

export default function EditIndividualForm({ individual, onSave, onCancel }: EditIndividualFormProps) {
  const { toast } = useToast();
  const form = useForm<IndividualFormData>({
    resolver: zodResolver(individualSchema),
    defaultValues: {
      gedcom_id: individual.gedcom_id,
      sex: individual.sex || "",
      names: individual.names?.length
        ? individual.names
        : [{ full: individual.names?.[0]?.full || "", given: "", surname: "", type: "", prefix: "", suffix: "" }],
      events: individual.events?.length
        ? individual.events
        : [{ event_type: "", date: "", place: "", note: "" }],
    },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const {
    fields: nameFields,
    append: appendName,
    remove: removeName,
  } = useFieldArray({ control, name: "names" });

  const {
    fields: eventFields,
    append: appendEvent,
    remove: removeEvent,
  } = useFieldArray({ control, name: "events" });

  const onSubmit = async (data: IndividualFormData) => {
    try {
      onSave?.(data);
      toast({ title: "Saved", description: "Individual record updated successfully." });
    } catch {
      toast({
        title: "Error",
        description: "Failed to save changes.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>GEDCOM ID: {individual.gedcom_id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gedcom_id">GEDCOM ID</Label>
              <Input id="gedcom_id" {...register("gedcom_id")} readOnly className="bg-muted" />
              {errors.gedcom_id && (
                <p className="text-sm text-destructive">{errors.gedcom_id.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sex">Sex</Label>
              <select
                id="sex"
                {...register("sex")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Not specified</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="names">
        <TabsList>
          <TabsTrigger value="names">Names ({nameFields.length})</TabsTrigger>
          <TabsTrigger value="events">Events ({eventFields.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="names">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Names</CardTitle>
                <CardDescription>Individual names and variants</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendName({ full: "", given: "", surname: "", type: "", prefix: "", suffix: "" })
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Name
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {nameFields.map((field, index) => (
                <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      Name {index + 1}
                    </span>
                    {nameFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeName(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2 lg:col-span-3">
                      <Label htmlFor={`names.${index}.full`}>Full Name *</Label>
                      <Input
                        id={`names.${index}.full`}
                        {...register(`names.${index}.full`)}
                        placeholder="John William Smith"
                      />
                      {errors.names?.[index]?.full && (
                        <p className="text-sm text-destructive">
                          {errors.names[index]?.full?.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`names.${index}.prefix`}>Prefix</Label>
                      <Input
                        id={`names.${index}.prefix`}
                        {...register(`names.${index}.prefix`)}
                        placeholder="Dr."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`names.${index}.given`}>Given Names</Label>
                      <Input
                        id={`names.${index}.given`}
                        {...register(`names.${index}.given`)}
                        placeholder="John William"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`names.${index}.surname`}>Surname</Label>
                      <Input
                        id={`names.${index}.surname`}
                        {...register(`names.${index}.surname`)}
                        placeholder="Smith"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`names.${index}.type`}>Type</Label>
                      <select
                        id={`names.${index}.type`}
                        {...register(`names.${index}.type`)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Personal name</option>
                        <option value="AKA">Also known as</option>
                        <option value="BIRT">Birth name</option>
                        <option value="MAID">Maiden name</option>
                        <option value="MAR">Married name</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`names.${index}.suffix`}>Suffix</Label>
                      <Input
                        id={`names.${index}.suffix`}
                        {...register(`names.${index}.suffix`)}
                        placeholder="Jr."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Events</CardTitle>
                <CardDescription>Life events and key dates</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendEvent({ event_type: "", date: "", place: "", note: "" })
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {eventFields.map((field, index) => (
                <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      Event {index + 1}
                    </span>
                    {eventFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEvent(index)}
                      >
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
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                      {errors.events?.[index]?.event_type && (
                        <p className="text-sm text-destructive">
                          {errors.events[index]?.event_type?.message}
                        </p>
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
                        placeholder="Optional note about this event..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
