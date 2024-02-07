"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { firebaseConfig } from "@/lib/firebase";
import { initializeApp } from "firebase/app";
import { onValue, ref, getDatabase, set, push } from "firebase/database";
import { useState } from "react";
import { Button } from "@/components/ui/button";

import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { redirect } from "next/navigation";

export default function TaskInput() {
  const app = initializeApp(firebaseConfig);
  const database = getDatabase();

  const styles = [
    { label: "Default", value: "default" },
    { label: "Secondary", value: "secondary" },
    { label: "Outline", value: "outline" },
    { label: "Destructive", value: "destructive" },
  ];

  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [openStates, setOpenStates] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);

  const handleAddTag = () => {
    setTags([...tags, { name: '', style: '' }]);
    setOpenStates([...openStates, false]);
    setSelectedValues([...selectedValues, '']);
  };

  const handleRemoveTag = (index) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);

    const newOpenStates = [...openStates];
    newOpenStates.splice(index, 1);
    setOpenStates(newOpenStates);

    const newSelectedValues = [...selectedValues];
    newSelectedValues.splice(index, 1);
    setSelectedValues(newSelectedValues);
  };

  
  const handleSubmit = () => {
    // Create an object with the desired structure
    const formData = {
      desc: taskDescription,
      name: taskName,
      tags: tags.map((tag) => ({
        style: tag.style,
        text: tag.name,
      })),
    };

    // Log or use the formData object as needed
    set(push(ref(database, 'tasks/')), formData);     

    // Reset form fields and tags after submission
    setTaskName('');
    setTaskDescription('');
    setTags([]);
    setOpenStates([]);
    setSelectedValues([]);
  };

  return (
    <div className="max-h-[100vh] min-h-[100vh] flex flex-col gap-5 p-5 overflow-scroll no-scrollbar">
      <Card className="entry p-5 flex flex-col gap-5 max-h-[80vh] overflow-scroll no-scrollbar">
        <Input
          placeholder="Task Name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          mb={2}
        />
        <Textarea
          placeholder="Task Description"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          mb={2}
        />

<Button colorScheme="teal" onClick={handleAddTag} mt={4}>
        Add Tag
      </Button>

        {tags.map((tag, index) => (
          <Card key={index} className="p-4 mb-0 flex flex-col gap-5">
            <Input
              placeholder="Tag Name"
              value={tag.name}
              onChange={(e) => {
                const newTags = [...tags];
                newTags[index].name = e.target.value;
                setTags(newTags);
              }}
            />
            <Popover
            open={openStates[index]}
            onOpenChange={(newOpenState) => {
              const newOpenStates = [...openStates];
              newOpenStates[index] = newOpenState;
              setOpenStates(newOpenStates);
            }}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openStates[index]}
                className="w-[100%] justify-between"
              >
                {selectedValues[index]
                  ? styles.find((style) => style.value === selectedValues[index])?.label
                  : 'Select style...'}
                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[46vw] p-0">
              <Command>
                <CommandInput placeholder="Search style..." className="h-9" />
                <CommandEmpty>No style found.</CommandEmpty>
                <CommandGroup>
                  {styles.map((style) => (
                    <CommandItem
                      key={style.value}
                      value={style.value}
                      onSelect={(currentValue) => {
                        const newTags = [...tags];
                        newTags[index].style = currentValue;
                        setTags(newTags);
                        const newSelectedValues = [...selectedValues];
                        newSelectedValues[index] = currentValue;
                        setSelectedValues(newSelectedValues);
                        const newOpenStates = [...openStates];
                        newOpenStates[index] = false;
                        setOpenStates(newOpenStates);
                      }}
                    >
                      {style.label}
                      <CheckIcon
                        className={cn(
                          'ml-auto h-4 w-4',
                          selectedValues[index] === style.value ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
            <Button size="sm" colorScheme="red" mt={2} onClick={() => handleRemoveTag(index)}>
              Remove Tag
            </Button>
          </Card>
        ))}

        <Button colorScheme="teal" onClick={handleSubmit}>
          Send
        </Button>
      </Card>

      <Card className="entry p-5 flex flex-col gap-5 max-h-[80vh] overflow-scroll no-scrollbar">
        <Button onClick={() => {window.location.href = "/"}}>Global Dashboard</Button>
        <Button onClick={() => {window.location.href = "/team"}} variant="secondary">Team Dashboard</Button>
        <Separator/>
        <Button onClick={() => {window.location.href = "/admin/db/dashboard"}} variant="outline">Database Dashboard</Button>
      </Card>
    </div>
  );
}
