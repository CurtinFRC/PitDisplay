"use client";

import React, { useState } from 'react';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

import { firebaseConfig } from "@/lib/firebase";

import { initializeApp } from "firebase/app";

import { getDatabase, onValue, ref, remove, set } from "firebase/database";
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

import { 
  getDownloadURL, 
  getStorage, 
  ref as storage_ref, 
  updateMetadata, 
  uploadBytes 
} from "firebase/storage";

export default function DatabaseDashboard() {
  const [selectedDiv, setSelectedDiv] = useState('');
  const [activeTasks, setActiveTasks] = useState([])
  const [completedTasks, setCompletedTasks] = useState([]);

  const [canGetTasks, setCanGetTasks] = useState(true);

  const [strategy, setStrategy] = useState('');
  const [strategyImage, setStrategyImage] = useState(null);

  const [canGetStrats, setCanGetStrats] = useState(true);

  const app = initializeApp(firebaseConfig);
  const database = getDatabase();
  const storage = getStorage();
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    // Validate if a file is selected
    if (file) {
      setStrategyImage(file);
    }
  };
  
  const handleImageUpload = () => {
    // Upload the image to Firebase Storage
    if (strategyImage) {
      const storageRef = storage_ref(storage, `strategy_image.png`);
      
      uploadBytes(storageRef, strategyImage).then((snapshot) => {
        console.log("Uploaded");
      })

    }
  };

  function GetTasks() {
    if (canGetTasks) {
      setCanGetTasks(false);
      onValue(ref(database, 'tasks/'), (snapshot) => {
        if (snapshot.val() == null) {
          setActiveTasks([]);
          return;
        }

        // get all of the object keys
        let ids: string[] = Object.keys(snapshot.val());

        let t: any[] = Object.values(snapshot.val());
        if (snapshot.val() == 'null') {
          t = [];
        }

        for (let i = 0; i < t.length; i++) {
          if (t[i].tags == 'null' || !t[i].tags) {
            t[i].tags = [];
          }

          t[i].id = ids[i];
        }
        setActiveTasks(t);
      

      onValue(ref(database, 'completedTasks/'), (snapshot) => {
        if (snapshot.val() == null) {
          setCompletedTasks([]);
          return;
        }

        // get all of the object keys
        let ids: string[] = Object.keys(snapshot.val());

        let t: any[] = Object.values(snapshot.val());
        if (snapshot.val() == 'null') {
          t = [];
        }

        for (let i = 0; i < t.length; i++) {
          if (t[i].tags == 'null' || !t[i].tags) {
            t[i].tags = [];
          }

          t[i].id = ids[i];
        }
        setCompletedTasks(t);

        setTimeout(() => {
          setCanGetTasks(true);
        }, 1000);
      })});
    }
  }

  


  function CompleteTask(task: string) {
    // remove tasks/{task} from db
 
    onValue(ref(database, 'tasks/' + task), (snapshot) => {
      remove(ref(database, 'tasks/' + task));

      set(ref(database, 'completedTasks/' + task), snapshot.val());
    });
  }


  function DeleteTask(task: string) {
    remove(ref(database, 'completedTasks/' + task));
  }

  function RestoreTask(task: string) {
    onValue(ref(database, 'completedTasks/' + task), (snapshot) => {
      remove(ref(database, 'completedTasks/' + task));

      set(ref(database, 'tasks/' + task), snapshot.val());
    });
  }

  const options = [
    { id: 'strats', label: 'Strategy'},
    { id: 'sep', label: null},
    { id: 'ctasks', label: 'Completed Tasks' },
    { id: 'atasks', label: 'Active Tasks' },
  ];

  const handleTextChange = (event) => {
    setStrategy(event.target.value);
  }

  function updateStrategy() {
    set(ref(database, 'strategy'), strategy);
    handleImageUpload();
  }

  const divs = [
    { id: 'ctasks', title: 'Completed Tasks', content: completedTasks.map((task: any) => (
      <Card className="p-3 taskGrid task flex flex-col overflow-scroll no-scrollbar mb-[1%] max-h-[105%] min-h-[105%]">
        <Card className="flex flex-row items-center text-left p-2 gap-2"> 
          {task.tags.map((tag) => (<Badge variant={tag.style}>{tag.text}</Badge>))}
          <Label>{task.name}</Label> 
        </Card>
        <Card className="p-2">
          <Label>{task.desc}</Label>
        </Card>
          <div className="button-grid">
            <Button variant="outline" colorScheme="teal" onClick={() => {RestoreTask(task.id)}}>Restore</Button>
            <Button variant="destructive" colorScheme="teal" onClick={() => {DeleteTask(task.id)}}>Delete</Button>
          </div>
      </Card>
      ))      
    },
    { id: 'atasks', title: 'Active Tasks', content: activeTasks.map((task: any) => (
      <Card className="p-3 taskGrid task flex flex-col overflow-scroll no-scrollbar mb-[1%] max-h-[105%] min-h-[105%]">
        <Card className="flex flex-row items-center text-left p-2 gap-2"> 
          {task.tags.map((tag) => (<Badge variant={tag.style}>{tag.text}</Badge>))}
          <Label>{task.name}</Label> 
        </Card>
        <Card className="p-2">
          <Label>{task.desc}</Label>
        </Card>
          <Button variant="outline" colorScheme="teal" onClick={() => {CompleteTask(task.id)}}>Complete</Button>
      </Card>
      ))
    },
    { id: 'strats', title: 'Strategy', content: (
      <div className="strats-grid">
        
        <Textarea className="min-h-[70vh]" value={strategy} onChange={handleTextChange}/>
        <div className="strats-grid-second flex flex-row">
        <div className="grid w-full gap-1.5 max-h-[2vh]">
          <Input id="image" type="file" className="min-w-[50%]" onChange={handleImageChange}/>
        </div>

        <Button onClick={() => {updateStrategy()}} className="min-w-[50%]">Update Strategy</Button>
        </div>
      </div>
    )},
  ];

  const handleOptionSelect = (selectedId) => {
    setSelectedDiv(selectedId);
  };

  if (canGetStrats) {
    setCanGetStrats(false);
    setSelectedDiv(divs[0].id);
    onValue(ref(database, 'strategy'), (snapshot) => {
      setStrategy(snapshot.val());
      console.log(snapshot.val())
    });
  }

  GetTasks();


  return (
   <Card className="m-5 p-3 min-h-[95vh] flex flex-row gap-5 max-h-[95vh]">
    <Card className="p-5 flex flex-col gap-5 min-w-[15%]"> 
      {options.map((option) => 
          option.id != 'sep' ? (
        <Button key={option.id} onClick={() => handleOptionSelect(option.id)}>
          {option.label}
        </Button> ) : <Separator/>
        )}
    </Card>
    <Card className="min-w-[83%] overflow-scroll no-scrollbar min-h-[92vh]">
      {divs.map((div) => (
        <div key={div.id} style={{ display: div.id === selectedDiv ? 'block' : 'none'}} className="p-4 min-h-[100%] overflow-scroll no-scrollbar">
          <Label>{div.title}</Label> 
          <div className="mt-[1%]">{div.content}</div>
        </div>
      ))}
    </Card>     
  </Card>
  )
}
