"use client";

import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { uploadVideo } from "@/firebase/functions";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";

const supportedFormats = [
  "mp4",
  "avi",
  "mov",
  "mkv",
  "wmv",
  "flv",
  "webm",
  "mpeg",
  "mts",
  "3gp",
];

function Upload() {
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    toast.promise(uploadVideo(values.video, values.title, values.description), {
      loading: "Uploading video...",
      success: "Video uploaded successfully!",
      error: "Error uploading video",
    });
  };

  const formSchema = z.object({
    title: z
      .string()
      .min(1, {
        message: "Title must be at least 1 character long.",
      })
      .max(100, {
        message: "Title cannot be longer than 100 characters",
      }),
    description: z
      .string()
      .min(1, {
        message: "Description must be at least 1 character long.",
      })
      .max(5000, {
        message: "Description cannot be longer than 5000 characters",
      }),
    video: z
      .instanceof(File, { message: "Please select a video file." })
      .refine(
        (file) => {
          const extension = file.name.split(".").pop()?.toLowerCase();
          return extension ? supportedFormats.includes(extension) : false;
        },
        {
          message: `Unsupported file format. Supported formats: ${supportedFormats.join(
            ", "
          )}`,
        }
      ),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  return (
    <Form {...form}>
      <form
        className="flex flex-col max-w-screen-lg mx-auto p-4 space-y-8"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                {/* ...field gives the input a random id */}
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="video"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormLabel>Video</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onChange(file);
                    }
                  }}
                  {...rest}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="max-w-32" type="submit">
          Upload
        </Button>
      </form>
    </Form>
  );
}

export default Upload;
