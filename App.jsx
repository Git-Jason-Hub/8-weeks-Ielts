import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const weeks = Array.from({ length: 8 }, (_, i) => `第${i + 1}周`);
const days = Array.from({ length: 7 }, (_, i) => `第${i + 1}天`);

const tasks = days.reduce((acc, day) => {
  acc[day] = `任务安排：\n- 听力练习30分钟\n- 阅读理解1篇\n- 写作构思或段落练习\n- 口语自我表达录音\n- 背诵5个新词汇`;
  return acc;
}, {});

export default function IELTSPlan() {
  const [selectedWeek, setSelectedWeek] = useState(weeks[0]);
  const [progress, setProgress] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("ielts-progress") || "[]") || Array(8).fill(false);
    }
    return Array(8).fill(false);
  });
  const [notes, setNotes] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("ielts-notes") || "{}");
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem("ielts-progress", JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem("ielts-notes", JSON.stringify(notes));
  }, [notes]);

  const toggleProgress = (index) => {
    const newProgress = [...progress];
    newProgress[index] = !newProgress[index];
    setProgress(newProgress);
  };

  const percent = (progress.filter(Boolean).length / progress.length) * 100;

  const handleNoteChange = (day, value) => {
    setNotes((prev) => ({ ...prev, [day]: value }));
  };

  const exportNotes = () => {
    const content = Object.entries(notes)
      .map(([key, value]) => `${key}\n${value}\n`)
      .join("\n-------------------------\n\n");
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "IELTS_Notes.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const now = new Date();
    const reminderKey = `reminder-${now.toLocaleDateString()}`;
    if (!localStorage.getItem(reminderKey)) {
      setTimeout(() => {
        alert("🕐 记得今天按计划学习并打卡哦！");
        localStorage.setItem(reminderKey, "true");
      }, 3000);
    }
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center">📘 雅思两个月备考计划</h1>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">完成进度</h2>
        <Progress value={percent} />
        <p className="text-sm text-muted-foreground">{percent.toFixed(0)}% 已完成</p>
        <Button onClick={exportNotes} className="mt-2">📤 导出所有学习笔记</Button>
      </div>

      <Tabs value={selectedWeek} onValueChange={setSelectedWeek} className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {weeks.map((week, index) => (
            <div key={week} className="flex flex-col items-center">
              <TabsTrigger value={week} className="text-sm w-full">
                {week}
              </TabsTrigger>
              <Checkbox
                checked={progress[index]}
                onCheckedChange={() => toggleProgress(index)}
              />
              <span className="text-xs text-muted-foreground">打卡</span>
            </div>
          ))}
        </TabsList>

        {weeks.map((week) => (
          <TabsContent key={week} value={week}>
            <Card>
              <CardContent className="p-4 space-y-4">
                <ScrollArea className="h-[30rem] sm:h-[28rem]">
                  <div className="space-y-4">
                    {days.map((day) => (
                      <div key={day} className="space-y-2">
                        <h3 className="font-semibold text-base">{week} - {day}</h3>
                        <p className="whitespace-pre-line text-sm text-muted-foreground">{tasks[day]}</p>
                        <Textarea
                          placeholder="记录你的学习笔记或反馈..."
                          value={notes[`${week}-${day}`] || ""}
                          onChange={(e) => handleNoteChange(`${week}-${day}`, e.target.value)}
                          className="resize-none"
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
