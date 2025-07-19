# OS---DAVE-NEO
DEB303 - Dave Torrefranca | strife1997 - Neo Kent Durano

                  INTRODUCTION
Our CPU Scheduler Visualization Project is a web-based interactive tool we developed to simulate and visualize how various CPU scheduling algorithms operate. The goal of this project is to help students, educators, and learners understand the effects of different scheduling strategies on process execution, waiting time, turnaround time, and CPU efficiency. 
We used Visual Studio Code (VS Code) as our main development environment and implemented the project using JavaScript. For the user interface, we built everything on the web, making it accessible, responsive, and easy to interact with directly from a browser.
We created this project to turn theoretical scheduling concepts into a more visual, intuitive, and hands-on experience. By building it on the web, we made it easily accessible to anyone with a browser—no installation required. Our use of JavaScript helped us make the simulation dynamic and interactive, while VS Code allowed us to efficiently code and manage the entire project.

                OUR PROJECT FEATURES
-Web-based Gantt Chart Visualizations to show how processes are scheduled over time.
-Custom Input Fields for users to enter arrival time, burst time, priorities, and more.
-Live Calculation of Metrics, including average waiting time, turnaround time, and CPU utilization.
-Interactive Controls to start, pause, or step through simulations.  

     SCHEDULING ALGORITHMS 

FCFS 

-Non-preemptive.
-Executes processes in order of arrival.

SJF 

-Non-preemptive.
-Selects the job with the shortest burst time among ready processes.
-SRTF (Shortest Remaining Time First)

Shortest Remaining Time

If a shorter job arrives, it preempts the currently running process.

Round Robin

Preemptive.
-Processes are given a fixed time slice (quantum).
-After that, they are moved to the back of the queue if not finished.

MLFQ 

-Preemptive and priority-based.
-Uses multiple queues with different time quantums.
-Jobs move to lower priority queues if they consume their quantum.          

SAMPLE OF RUNNING THE ALGORITHMS

<img width="1564" height="811" alt="image" src="https://github.com/user-attachments/assets/f942ea4a-b8a8-4fd9-a712-7613ae923c61" />
<img width="1516" height="706" alt="image" src="https://github.com/user-attachments/assets/1caf1815-07a5-4a05-864c-6dbbc9173b45" />
<img width="1006" height="841" alt="image" src="https://github.com/user-attachments/assets/fb6bd33f-2a4e-4ff5-b33c-398c3984c7f9" />
<img width="1002" height="753" alt="image" src="https://github.com/user-attachments/assets/b6a930c7-6a48-4a45-ab32-7b5e56a9c517" />
<img width="1000" height="744" alt="image" src="https://github.com/user-attachments/assets/90d84f92-5660-4ba4-9212-7d0750820f62" />
<img width="1032" height="707" alt="image" src="https://github.com/user-attachments/assets/0db33f42-ea1b-4ef3-aaf3-9f5cc6b22468" />
<img width="1003" height="788" alt="image" src="https://github.com/user-attachments/assets/e2fb2bc0-5215-4d31-8655-56e9e8842d70" />
<img width="1034" height="712" alt="image" src="https://github.com/user-attachments/assets/2975737b-10c7-4d77-8e74-bf40fcb2e54b" />
<img width="1000" height="848" alt="image" src="https://github.com/user-attachments/assets/af7058a1-8039-4d7d-ad3c-d7c12992a00a" />
<img width="988" height="791" alt="image" src="https://github.com/user-attachments/assets/84bc2bf6-6756-4199-8e6f-3a8068c35d49" />

CHALLENGES FACED

-Having hard time on the backend, specifically on the algorithms
-No support for I/O-bound processes
-Didn't have the chance to make the animation we wanted on the gantt chart table
-The result of the algorithms are hard to predict



MEMBER CONTRIBUTIONS

Neokent Durano - Backend
Dave Torrefranca - Frontend
(we dont just focus on our roles, we also help in both area)







