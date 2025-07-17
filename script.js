document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const processTable = document.getElementById('processTable');
    const addProcessBtn = document.getElementById('addProcess');
    const generateRandomBtn = document.getElementById('generateRandom');
    const algorithmSelect = document.getElementById('algorithm');
    const quantumSection = document.getElementById('quantumSection');
    const mlfqControls = document.getElementById('mlfqControls');
    const runSimulationBtn = document.getElementById('runSimulation');
    const ganttChart = document.getElementById('ganttChart');
    const metricsTable = document.getElementById('metricsTable');
    const queueLegend = document.getElementById('queueLegend');
    const timeLabels = document.getElementById('timeLabels');
    const algorithmInfo = document.getElementById('algorithmInfo');
    
    // Algorithm descriptions
    const algorithmDescriptions = {
        'FCFS': 'Processes are executed in the order they arrive. Simple but may result in long waiting times for short processes.',
        'SJF': 'Executes the process with the smallest burst time next. Non-preemptive version completes each process once started.',
        'SRTF': 'Preemptive version of SJF. The process with the smallest remaining time is executed next. More responsive than SJF.',
        'RR': 'Each process gets a small unit of CPU time (time quantum). Fair but may have high context switching overhead.',
        'MLFQ': 'Uses multiple queues with different priorities. Processes move between queues based on their behavior and resource usage.'
    };
    
    // Initialize queue legend
    function initQueueLegend() {
        queueLegend.innerHTML = '';
        const queues = [
            {name: 'Q0 (Highest Priority)', class: 'queue-0'},
            {name: 'Q1', class: 'queue-1'},
            {name: 'Q2', class: 'queue-2'},
            {name: 'Q3 (Lowest Priority)', class: 'queue-3'}
        ];
        
        queues.forEach(queue => {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            legendItem.innerHTML = `
                <div class="legend-color ${queue.class}"></div>
                <div>${queue.name}</div>
            `;
            queueLegend.appendChild(legendItem);
        });
    }
    
    initQueueLegend();
    
    // Update algorithm info
    algorithmSelect.addEventListener('change', function() {
        const algo = this.value;
        algorithmInfo.textContent = algorithmDescriptions[algo];
        
        // Show/hide quantum input based on algorithm
        if (algo === 'RR' || algo === 'MLFQ') {
            quantumSection.style.display = 'block';
        } else {
            quantumSection.style.display = 'none';
        }
        
        // Show/hide MLFQ controls
        if (algo === 'MLFQ') {
            mlfqControls.style.display = 'block';
        } else {
            mlfqControls.style.display = 'none';
        }
    });
    
    // Add event listeners to existing remove buttons
    document.querySelectorAll('.removeBtn').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const tbody = row.parentElement;
            if (tbody.rows.length > 1) {
                row.remove();
                // Update process IDs
                const rows = tbody.querySelectorAll('tr');
                rows.forEach((r, i) => {
                    r.cells[0].textContent = `P${i}`;
                });
            } else {
                alert('You need at least one process!');
            }
        });
    });
    
    // Add process button
    addProcessBtn.addEventListener('click', function() {
        const tbody = processTable.querySelector('tbody');
        const rowCount = tbody.rows.length;
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>P${rowCount}</td>
            <td><input type="number" class="arrival" value="${rowCount}" min="0"></td>
            <td><input type="number" class="burst" value="${Math.floor(Math.random() * 10) + 1}" min="1"></td>
            <td><button class="removeBtn">Remove</button></td>
        `;
        
        tbody.appendChild(row);
        
        // Add event listener to new remove button
        row.querySelector('.removeBtn').addEventListener('click', function() {
            if (tbody.rows.length > 1) {
                row.remove();
                // Update process IDs
                const rows = tbody.querySelectorAll('tr');
                rows.forEach((r, i) => {
                    r.cells[0].textContent = `P${i}`;
                });
            } else {
                alert('You need at least one process!');
            }
        });
    });
    
    // Generate random processes
    generateRandomBtn.addEventListener('click', function() {
        const tbody = processTable.querySelector('tbody');
        tbody.innerHTML = '';
        const processCount = Math.floor(Math.random() * 5) + 3; // 3-7 processes
        
        for (let i = 0; i < processCount; i++) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>P${i}</td>
                <td><input type="number" class="arrival" value="${Math.floor(Math.random() * 5)}" min="0"></td>
                <td><input type="number" class="burst" value="${Math.floor(Math.random() * 10) + 1}" min="1"></td>
                <td><button class="removeBtn">Remove</button></td>
            `;
            tbody.appendChild(row);
            
            // Add event listener to remove button
            row.querySelector('.removeBtn').addEventListener('click', function() {
                if (tbody.rows.length > 1) {
                    row.remove();
                    // Update process IDs
                    const rows = tbody.querySelectorAll('tr');
                    rows.forEach((r, idx) => {
                        r.cells[0].textContent = `P${idx}`;
                    });
                } else {
                    alert('You need at least one process!');
                }
            });
        }
    });
    
    // Run simulation
    runSimulationBtn.addEventListener('click', function() {
        // Get processes
        const processes = [];
        const rows = processTable.querySelectorAll('tbody tr');
        rows.forEach((row, i) => {
            const arrival = parseInt(row.querySelector('.arrival').value);
            const burst = parseInt(row.querySelector('.burst').value);
            processes.push({
                id: `P${i}`,
                arrival: arrival,
                burst: burst,
                remaining: burst,
                startTime: -1,
                finishTime: -1,
                responseTime: -1
            });
        });
        
        // Get algorithm and parameters
        const algorithm = algorithmSelect.value;
        const quantum = algorithm === 'RR' || algorithm === 'MLFQ' ? 
            parseInt(document.getElementById('quantum').value) : 0;
        
        // Run selected algorithm
        let results;
        switch (algorithm) {
            case 'FCFS':
                results = runFCFS([...processes]);
                break;
            case 'SJF':
                results = runSJF([...processes]);
                break;
            case 'SRTF':
                results = runSRTF([...processes]);
                break;
            case 'RR':
                results = runRR([...processes], quantum);
                break;
            case 'MLFQ':
                // Get MLFQ parameters
                const mlfqParams = [];
                const mlfqRows = mlfqControls.querySelectorAll('tbody tr');
                mlfqRows.forEach(row => {
                    const quantum = parseInt(row.querySelector('.mlfq-quantum').value);
                    const allotment = parseInt(row.querySelector('.mlfq-allotment').value);
                    mlfqParams.push({quantum, allotment});
                });
                results = runMLFQ([...processes], mlfqParams);
                break;
            default:
                results = {gantt: [], metrics: []};
        }
        
        // Display results
        displayResults(results.gantt, results.metrics);
    });
    
    // Scheduling Algorithms
    
    // First-Come First-Served (FCFS)
    function runFCFS(processes) {
        // Sort processes by arrival time
        processes.sort((a, b) => a.arrival - b.arrival);
        
        let currentTime = 0;
        const gantt = [];
        const metrics = [];
        
        for (const process of processes) {
            // If process hasn't arrived yet, wait for it
            if (currentTime < process.arrival) {
                currentTime = process.arrival;
            }
            
            // Record start time
            process.startTime = currentTime;
            process.responseTime = process.startTime - process.arrival;
            
            // Execute process
            gantt.push({
                process: process.id,
                start: currentTime,
                end: currentTime + process.burst,
                queue: 0
            });
            
            // Update current time
            currentTime += process.burst;
            
            // Record finish time
            process.finishTime = currentTime;
            
            // Calculate metrics
            const turnaround = process.finishTime - process.arrival;
            const waiting = turnaround - process.burst;
            
            metrics.push({
                id: process.id,
                arrival: process.arrival,
                burst: process.burst,
                finish: process.finishTime,
                turnaround: turnaround,
                waiting: waiting,
                response: process.responseTime
            });
        }
        
        return {gantt, metrics};
    }
    
    // Shortest Job First (SJF) - Non-preemptive
    function runSJF(processes) {
        let currentTime = 0;
        let completed = 0;
        const gantt = [];
        const metrics = [];
        
        // Initialize processes
        processes.forEach(p => p.remaining = p.burst);
        
        while (completed < processes.length) {
            // Get arrived processes that haven't completed
            const arrived = processes.filter(p => 
                p.arrival <= currentTime && p.remaining > 0
            );
            
            if (arrived.length === 0) {
                currentTime++;
                continue;
            }
            
            // Find the process with the shortest burst time
            arrived.sort((a, b) => a.remaining - b.remaining);
            const process = arrived[0];
            
            // Record start time if not started
            if (process.startTime === -1) {
                process.startTime = currentTime;
                process.responseTime = process.startTime - process.arrival;
            }
            
            // Execute the entire process (non-preemptive)
            gantt.push({
                process: process.id,
                start: currentTime,
                end: currentTime + process.remaining,
                queue: 0
            });
            
            currentTime += process.remaining;
            process.remaining = 0;
            process.finishTime = currentTime;
            completed++;
            
            // Calculate metrics
            const turnaround = process.finishTime - process.arrival;
            const waiting = turnaround - process.burst;
            
            metrics.push({
                id: process.id,
                arrival: process.arrival,
                burst: process.burst,
                finish: process.finishTime,
                turnaround: turnaround,
                waiting: waiting,
                response: process.responseTime
            });
        }
        
        return {gantt, metrics};
    }
    
    // Shortest Remaining Time First (SRTF) - Preemptive
    function runSRTF(processes) {
        let currentTime = 0;
        let completed = 0;
        let lastProcess = null;
        const gantt = [];
        const metrics = [];
        
        // Initialize processes
        processes.forEach(p => p.remaining = p.burst);
        
        while (completed < processes.length) {
            // Get arrived processes that haven't completed
            const arrived = processes.filter(p => 
                p.arrival <= currentTime && p.remaining > 0
            );
            
            if (arrived.length === 0) {
                currentTime++;
                continue;
            }
            
            // Find the process with the shortest remaining time
            arrived.sort((a, b) => a.remaining - b.remaining);
            const process = arrived[0];
            
            // Record start time if not started
            if (process.startTime === -1) {
                process.startTime = currentTime;
                process.responseTime = process.startTime - process.arrival;
            }
            
            // Check if we need to create a new Gantt block
            if (!lastProcess || lastProcess.id !== process.id) {
                if (lastProcess) {
                    // End the last block
                    gantt[gantt.length - 1].end = currentTime;
                }
                // Start a new block
                gantt.push({
                    process: process.id,
                    start: currentTime,
                    end: currentTime + 1,
                    queue: 0
                });
            } else {
                // Extend the current block
                gantt[gantt.length - 1].end = currentTime + 1;
            }
            
            lastProcess = process;
            
            // Execute for 1 time unit
            process.remaining--;
            currentTime++;
            
            // Check if process completed
            if (process.remaining === 0) {
                process.finishTime = currentTime;
                completed++;
                
                // Calculate metrics
                const turnaround = process.finishTime - process.arrival;
                const waiting = turnaround - process.burst;
                
                metrics.push({
                    id: process.id,
                    arrival: process.arrival,
                    burst: process.burst,
                    finish: process.finishTime,
                    turnaround: turnaround,
                    waiting: waiting,
                    response: process.responseTime
                });
            }
        }
        
        return {gantt, metrics};
    }
    
    // Round Robin (RR)
    function runRR(processes, quantum) {
        let currentTime = 0;
        let completed = 0;
        const queue = [];
        const gantt = [];
        const metrics = [];
        
        // Initialize processes
        processes.forEach(p => {
            p.remaining = p.burst;
            p.lastRun = -1;
        });
        
        while (completed < processes.length) {
            // Add arrived processes to the queue
            processes.forEach(p => {
                if (p.arrival === currentTime && !queue.includes(p)) {
                    queue.push(p);
                }
            });
            
            if (queue.length === 0) {
                currentTime++;
                continue;
            }
            
            // Get next process from the queue
            const process = queue.shift();
            
            // Record start time if not started
            if (process.startTime === -1) {
                process.startTime = currentTime;
                process.responseTime = process.startTime - process.arrival;
            }
            
            // Determine how long to run (min of quantum or remaining time)
            const runTime = Math.min(quantum, process.remaining);
            
            // Create Gantt block
            gantt.push({
                process: process.id,
                start: currentTime,
                end: currentTime + runTime,
                queue: 0
            });
            
            // Update process
            process.remaining -= runTime;
            currentTime += runTime;
            
            // Add any processes that arrived during this time to the queue
            processes.forEach(p => {
                if (p !== process && p.arrival <= currentTime && 
                    p.remaining > 0 && !queue.includes(p) && p !== queue[0]) {
                    queue.push(p);
                }
            });
            
            // If process not completed, add back to queue
            if (process.remaining > 0) {
                queue.push(process);
            } else {
                // Process completed
                process.finishTime = currentTime;
                completed++;
                
                // Calculate metrics
                const turnaround = process.finishTime - process.arrival;
                const waiting = turnaround - process.burst;
                
                metrics.push({
                    id: process.id,
                    arrival: process.arrival,
                    burst: process.burst,
                    finish: process.finishTime,
                    turnaround: turnaround,
                    waiting: waiting,
                    response: process.responseTime
                });
            }
        }
        
        return {gantt, metrics};
    }
    
    // Multilevel Feedback Queue (MLFQ)
    function runMLFQ(processes, mlfqParams) {
        let currentTime = 0;
        let completed = 0;
        const queues = [[], [], [], []];
        const gantt = [];
        const metrics = [];
        
        // Initialize processes
        processes.forEach(p => {
            p.remaining = p.burst;
            p.queue = 0;
            p.queueTime = 0;
            p.quantumUsed = 0;
        });
        
        while (completed < processes.length) {
            // Add arrived processes to Q0
            processes.forEach(p => {
                if (p.arrival === currentTime && p.remaining > 0 && 
                    !queues[0].includes(p) && !queues[1].includes(p) && 
                    !queues[2].includes(p) && !queues[3].includes(p)) {
                    queues[0].push(p);
                }
            });
            
            // Find the highest priority non-empty queue
            let queueIndex = -1;
            for (let i = 0; i < 4; i++) {
                if (queues[i].length > 0) {
                    queueIndex = i;
                    break;
                }
            }
            
            if (queueIndex === -1) {
                currentTime++;
                continue;
            }
            
            // Get next process from the queue
            const process = queues[queueIndex].shift();
            
            // Record start time if not started
            if (process.startTime === -1) {
                process.startTime = currentTime;
                process.responseTime = process.startTime - process.arrival;
            }
            
            // Get queue parameters
            const queueParams = mlfqParams[queueIndex];
            const runTime = Math.min(
                1, // Run for 1 time unit
                process.remaining,
                queueParams.quantum - process.quantumUsed,
                queueParams.allotment - process.queueTime
            );
            
            // Create Gantt block
            gantt.push({
                process: process.id,
                start: currentTime,
                end: currentTime + runTime,
                queue: queueIndex
            });
            
            // Update process
            process.remaining -= runTime;
            process.quantumUsed += runTime;
            process.queueTime += runTime;
            currentTime += runTime;
            
            // Add any processes that arrived during this time to Q0
            processes.forEach(p => {
                if (p !== process && p.arrival <= currentTime && 
                    p.remaining > 0 && !queues[0].includes(p) && 
                    !queues[1].includes(p) && !queues[2].includes(p) && 
                    !queues[3].includes(p)) {
                    queues[0].push(p);
                }
            });
            
            if (process.remaining > 0) {
                // Check if quantum expired
                if (process.quantumUsed >= queueParams.quantum) {
                    // Move to next lower queue (if available)
                    const newQueue = Math.min(3, queueIndex + 1);
                    queues[newQueue].push(process);
                    process.queue = newQueue;
                    process.quantumUsed = 0;
                } 
                // Check if allotment expired
                else if (process.queueTime >= queueParams.allotment) {
                    // Move to next lower queue (if available)
                    const newQueue = Math.min(3, queueIndex + 1);
                    queues[newQueue].push(process);
                    process.queue = newQueue;
                    process.quantumUsed = 0;
                    process.queueTime = 0;
                } else {
                    // Put back in the same queue
                    queues[queueIndex].push(process);
                }
            } else {
                // Process completed
                process.finishTime = currentTime;
                completed++;
                
                // Calculate metrics
                const turnaround = process.finishTime - process.arrival;
                const waiting = turnaround - process.burst;
                
                metrics.push({
                    id: process.id,
                    arrival: process.arrival,
                    burst: process.burst,
                    finish: process.finishTime,
                    turnaround: turnaround,
                    waiting: waiting,
                    response: process.responseTime
                });
            }
        }
        
        return {gantt, metrics};
    }
    
    // Display results
    function displayResults(gantt, metrics) {
        // Clear previous results
        ganttChart.innerHTML = '';
        metricsTable.querySelector('tbody').innerHTML = '';
        timeLabels.innerHTML = '';
        
        // Display Gantt chart
        if (gantt.length === 0) {
            ganttChart.innerHTML = '<div class="gantt-block">No processes scheduled</div>';
            return;
        }
        
        let maxTime = 0;
        gantt.forEach(block => {
            const duration = block.end - block.start;
            const blockElement = document.createElement('div');
            blockElement.className = `gantt-block queue-${block.queue}`;
            blockElement.innerHTML = `
                <div>${block.process}</div>
                <div class="gantt-time">${block.start}</div>
            `;
            blockElement.style.flex = `${duration} 0 0`;
            ganttChart.appendChild(blockElement);
            
            if (block.end > maxTime) maxTime = block.end;
        });
        
        // Add time labels
        for (let i = 0; i <= maxTime; i += Math.max(1, Math.floor(maxTime/10))) {
            const span = document.createElement('span');
            span.textContent = i;
            timeLabels.appendChild(span);
        }
        
        // Display metrics
        let totalTurnaround = 0;
        let totalWaiting = 0;
        let totalResponse = 0;
        
        metrics.forEach(metric => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${metric.id}</td>
                <td>${metric.arrival}</td>
                <td>${metric.burst}</td>
                <td>${metric.finish}</td>
                <td>${metric.turnaround}</td>
                <td>${metric.waiting}</td>
                <td>${metric.response}</td>
            `;
            metricsTable.querySelector('tbody').appendChild(row);
            
            totalTurnaround += metric.turnaround;
            totalWaiting += metric.waiting;
            totalResponse += metric.response;
        });
        
        // Calculate and display averages
        const count = metrics.length;
        document.getElementById('avgTurnaround').textContent = 
            (totalTurnaround / count).toFixed(2);
        document.getElementById('avgWaiting').textContent = 
            (totalWaiting / count).toFixed(2);
        document.getElementById('avgResponse').textContent = 
            (totalResponse / count).toFixed(2);
    }
});