document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const processTable = document.getElementById('processTable');
    const addProcessBtn = document.getElementById('addProcess');
    const generateRandomBtn = document.getElementById('generateRandom');
    const algorithmSelect = document.getElementById('algorithm');
    const quantumSection = document.getElementById('quantumSection');
    const mlfqControls = document.getElementById('mlfqControls');
    const runSimulationBtn = document.getElementById('runSimulation');
    const exportResultsBtn = document.getElementById('exportResults');
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
        
        // Only show quantum for RR, not for MLFQ
        if (algo === 'RR') {
            quantumSection.style.display = 'block';
        } else {
            quantumSection.style.display = 'none';
        }
        
        if (algo === 'MLFQ') {
            mlfqControls.style.display = 'block';
        } else {
            mlfqControls.style.display = 'none';
        }
    });
    
    // Process table event listeners
    document.querySelectorAll('.removeBtn').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const tbody = row.parentElement;
            if (tbody.rows.length > 1) {
                row.remove();
                const rows = tbody.querySelectorAll('tr');
                rows.forEach((r, i) => r.cells[0].textContent = `P${i+1}`);
            } else {
                alert('You need at least one process!');
            }
        });
    });
    
    // Add process button
    addProcessBtn.addEventListener('click', function() {
        const tbody = processTable.querySelector('tbody');
        // Find the highest process number currently in the table
        let maxNum = 0;
        tbody.querySelectorAll('tr').forEach(row => {
            const idText = row.cells[0].textContent;
            const match = idText.match(/^P(\d+)$/);
            if (match) {
                const num = parseInt(match[1]);
                if (num > maxNum) maxNum = num;
            }
        });
        const nextNum = maxNum + 1;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>P${nextNum}</td>
            <td><input type="number" class="arrival" value="${nextNum-1}" min="0"></td>
            <td><input type="number" class="burst" value="${Math.floor(Math.random() * 10) + 1}" min="1"></td>
            <td><button class="removeBtn">Remove</button></td>
        `;
        tbody.appendChild(row);
        row.querySelector('.removeBtn').addEventListener('click', function() {
            if (tbody.rows.length > 1) {
                row.remove();
            } else {
                alert('You need at least one process!');
            }
        });
    });
    
    // Generate random processes
    generateRandomBtn.addEventListener('click', function() {
        const tbody = processTable.querySelector('tbody');
        tbody.innerHTML = '';
        const processCount = Math.floor(Math.random() * 5) + 1;
        for (let i = 1; i <= processCount; i++) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>P${i}</td>
                <td><input type="number" class="arrival" value="${Math.floor(Math.random() * 5)}" min="0"></td>
                <td><input type="number" class="burst" value="${Math.floor(Math.random() * 10) + 1}" min="1"></td>
                <td><button class="removeBtn">Remove</button></td>
            `;
            tbody.appendChild(row);
            row.querySelector('.removeBtn').addEventListener('click', function() {
                if (tbody.rows.length > 1) {
                    row.remove();
                } else {
                    alert('You need at least one process!');
                }
            });
        }
    });

    // Reset Function
    const resetProcessBtn = document.getElementById('resetProcess');
    resetProcessBtn.addEventListener('click', function() {
        const tbody = processTable.querySelector('tbody');
        tbody.innerHTML = '';

        const defaultRow = document.createElement('tr');
        defaultRow.innerHTML = `
            <td>P1</td>
            <td><input type="number" class="arrival" value="0" min="0"></td>
            <td><input type="number" class="burst" value="5" min="1"></td>
            <td><button class="removeBtn">Remove</button></td>
        `;
        tbody.appendChild(defaultRow);

        defaultRow.querySelector('.removeBtn').addEventListener('click', function() {
            if (tbody.rows.length > 1) {
                defaultRow.remove();
            } else {
                alert('You need at least one process!');
            }
        });

        ganttChart.innerHTML = '';
        timeLabels.innerHTML = '';
        document.querySelector('#metricsTable tbody').innerHTML = '';
        document.getElementById('avgTurnaround').textContent = '0.00';
        document.getElementById('avgWaiting').textContent = '0.00';
        document.getElementById('avgResponse').textContent = '0.00';
    });

    // Run simulation
    runSimulationBtn.addEventListener('click', function() {
        const processes = [];
        const rows = processTable.querySelectorAll('tbody tr');
        rows.forEach((row, i) => {
            processes.push({
                id: row.cells[0].textContent,
                arrival: parseInt(row.querySelector('.arrival').value),
                burst: parseInt(row.querySelector('.burst').value),
                remaining: parseInt(row.querySelector('.burst').value),
                startTime: -1,
                finishTime: -1,
                responseTime: -1
            });
        });
        
        const algorithm = algorithmSelect.value;
        const quantum = algorithm === 'RR' || algorithm === 'MLFQ' ? 
            parseInt(document.getElementById('quantum').value) : 0;
        
        // Collect MLFQ params if needed
        let mlfqParams = null;
        if (algorithm === 'MLFQ') {
            const quantumInputs = document.querySelectorAll('.mlfq-quantum');
            const allotmentInputs = document.querySelectorAll('.mlfq-allotment');
            mlfqParams = Array.from(quantumInputs).map((q, i) => ({
                quantum: parseInt(q.value),
                allotment: parseInt(allotmentInputs[i].value)
            }));
        }
        let results;
        switch (algorithm) {
            case 'FCFS': results = runFCFS([...processes]); break;
            case 'SJF': results = runSJF([...processes]); break;
            case 'SRTF': results = runSRTF([...processes]); break;
            case 'RR': results = runRR([...processes], quantum); break;
            case 'MLFQ': results = runMLFQ([...processes], mlfqParams); break;
            default: results = {gantt: [], metrics: []};
        }
        
        displayResults(results.gantt, results.metrics);

        window.lastSimulationResults = {
            gantt: results.gantt,
            metrics: results.metrics,
            algorithm: algorithm,
            quantum: quantum,
            mlfqParams: algorithm === 'MLFQ' ? mlfqParams : null
        };
    });
    
    // Scheduling Algorithms
    function runFCFS(processes) {

    // Export Results Functionality
    exportResultsBtn.addEventListener('click', function() {
        const results = window.lastSimulationResults;
        if (!results || !results.metrics || results.metrics.length === 0) {
            alert('No simulation results to export!');
            return;
        }

        let txt = '';
        txt += `CPU Scheduling Simulator Results\n`;
        txt += `Algorithm: ${results.algorithm}`;
        if (results.algorithm === 'RR') txt += ` (Quantum: ${results.quantum})`;
        if (results.algorithm === 'MLFQ' && results.mlfqParams) {
            txt += `\nMLFQ Parameters:`;
            results.mlfqParams.forEach((q, i) => {
                txt += `\n  Q${i}: Quantum=${q.quantum}, Allotment=${q.allotment}`;
            });
        }
        txt += '\n\n--- Gantt Chart ---\n';
        txt += 'Process\tStart\tEnd\tQueue\n';
        results.gantt.forEach(g => {
            txt += `${g.process}\t${g.start}\t${g.end}\tQ${g.queue}\n`;
        });

        txt += '\n--- Process Metrics ---\n';
        txt += 'ID\tArrival\tBurst\tCompletion\tTurnaround\tWaiting\tResponse\n';
        results.metrics.forEach(m => {
            txt += `${m.id}\t${m.arrival}\t${m.burst}\t${m.finish}\t${m.turnaround}\t${m.waiting}\t${m.response}\n`;
        });

        // Calculate averages
        const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
        txt += '\nAverages:\n';
        txt += `Turnaround: ${avg(results.metrics.map(m => m.turnaround)).toFixed(2)}\n`;
        txt += `Waiting: ${avg(results.metrics.map(m => m.waiting)).toFixed(2)}\n`;
        txt += `Response: ${avg(results.metrics.map(m => m.response)).toFixed(2)}\n`;

        // Download as txt file
        const blob = new Blob([txt], {type: 'text/plain'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'cpu_scheduling_results.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
        processes.sort((a, b) => a.arrival - b.arrival);
        let currentTime = 0;
        const gantt = [], metrics = [];
        
        for (const process of processes) {
            if (currentTime < process.arrival) currentTime = process.arrival;
            process.startTime = currentTime;
            process.responseTime = process.startTime - process.arrival;
            
            gantt.push({
                process: process.id,
                start: currentTime,
                end: currentTime + process.burst,
                queue: 0
            });
            
            currentTime += process.burst;
            process.finishTime = currentTime;
            
            metrics.push({
                id: process.id,
                arrival: process.arrival,
                burst: process.burst,
                finish: process.finishTime,
                turnaround: process.finishTime - process.arrival,
                waiting: (process.finishTime - process.arrival) - process.burst,
                response: process.responseTime
            });
        }
        return {gantt, metrics};
    }
    
    function runSJF(processes) {
        let currentTime = 0, completed = 0;
        const gantt = [], metrics = [];
        processes.forEach(p => p.remaining = p.burst);
        
        while (completed < processes.length) {
            const arrived = processes.filter(p => p.arrival <= currentTime && p.remaining > 0);
            if (arrived.length === 0) { currentTime++; continue; }
            
            arrived.sort((a, b) => a.remaining - b.remaining);
            const process = arrived[0];
            
            if (process.startTime === -1) {
                process.startTime = currentTime;
                process.responseTime = process.startTime - process.arrival;
            }
            
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
            
            metrics.push({
                id: process.id,
                arrival: process.arrival,
                burst: process.burst,
                finish: process.finishTime,
                turnaround: process.finishTime - process.arrival,
                waiting: (process.finishTime - process.arrival) - process.burst,
                response: process.responseTime
            });
        }
        return {gantt, metrics};
    }
    
    function runSRTF(processes) {
        let currentTime = 0, completed = 0, lastProcess = null;
        const gantt = [], metrics = [];
        processes.forEach(p => p.remaining = p.burst);
        
        while (completed < processes.length) {
            const arrived = processes.filter(p => p.arrival <= currentTime && p.remaining > 0);
            if (arrived.length === 0) { currentTime++; continue; }
            
            arrived.sort((a, b) => a.remaining - b.remaining);
            const process = arrived[0];
            
            if (process.startTime === -1) {
                process.startTime = currentTime;
                process.responseTime = process.startTime - process.arrival;
            }
            
            if (!lastProcess || lastProcess.id !== process.id) {
                if (lastProcess) gantt[gantt.length - 1].end = currentTime;
                gantt.push({
                    process: process.id,
                    start: currentTime,
                    end: currentTime + 1,
                    queue: 0
                });
            } else {
                gantt[gantt.length - 1].end = currentTime + 1;
            }
            
            lastProcess = process;
            process.remaining--;
            currentTime++;
            
            if (process.remaining === 0) {
                process.finishTime = currentTime;
                completed++;
                metrics.push({
                    id: process.id,
                    arrival: process.arrival,
                    burst: process.burst,
                    finish: process.finishTime,
                    turnaround: process.finishTime - process.arrival,
                    waiting: (process.finishTime - process.arrival) - process.burst,
                    response: process.responseTime
                });
            }
        }
        return {gantt, metrics};
    }
    
    function runRR(processes, quantum) {
        let currentTime = 0, completed = 0;
        const queue = [], gantt = [], metrics = [];
        processes.forEach(p => { p.remaining = p.burst; p.lastRun = -1; });
        
        while (completed < processes.length) {
            processes.forEach(p => {
                if (p.arrival === currentTime && !queue.includes(p)) queue.push(p);
            });
            
            if (queue.length === 0) { currentTime++; continue; }
            
            const process = queue.shift();
            if (process.startTime === -1) {
                process.startTime = currentTime;
                process.responseTime = process.startTime - process.arrival;
            }
            
            const runTime = Math.min(quantum, process.remaining);
            gantt.push({
                process: process.id,
                start: currentTime,
                end: currentTime + runTime,
                queue: 0
            });
            
            process.remaining -= runTime;
            currentTime += runTime;
            
            processes.forEach(p => {
                if (p !== process && p.arrival <= currentTime && 
                    p.remaining > 0 && !queue.includes(p) && p !== queue[0]) {
                    queue.push(p);
                }
            });
            
            if (process.remaining > 0) {
                queue.push(process);
            } else {
                process.finishTime = currentTime;
                completed++;
                metrics.push({
                    id: process.id,
                    arrival: process.arrival,
                    burst: process.burst,
                    finish: process.finishTime,
                    turnaround: process.finishTime - process.arrival,
                    waiting: (process.finishTime - process.arrival) - process.burst,
                    response: process.responseTime
                });
            }
        }
        return {gantt, metrics};
    }
    //NEW MLFQ
function runMLFQ(processes, mlfqParams) {
    let currentTime = 0, completed = 0;
    const queues = [[], [], [], []], gantt = [], metrics = [];

    processes.forEach(p => {
        p.remaining = p.burst;
        p.queue = 0;
        p.queueTime = 0;
        p.quantumUsed = 0;
        p.startTime = -1;         // <-- Ensure this is reset
        p.responseTime = -1;      // <-- Ensure this is reset
    });

    while (completed < processes.length) {
        // Add arriving processes to Q0
        processes.forEach(p => {
            if (p.arrival === currentTime && p.remaining > 0 &&
                !queues.some(q => q.includes(p))) {
                queues[0].push(p);
            }
        });

        // Find the first non-empty queue
        let queueIndex = queues.findIndex(q => q.length > 0);
        if (queueIndex === -1) {
            currentTime++;
            continue;
        }

        const process = queues[queueIndex].shift();

        // Set start time & response time ONCE
        if (process.startTime === -1) {
            process.startTime = currentTime;
            process.responseTime = currentTime - process.arrival;
        }

        const params = mlfqParams[queueIndex];
        const runTime = Math.min(1, process.remaining,
                                 params.quantum - process.quantumUsed,
                                 params.allotment - process.queueTime);

        gantt.push({
            process: process.id,
            start: currentTime,
            end: currentTime + runTime,
            queue: queueIndex
        });

        process.remaining -= runTime;
        process.quantumUsed += runTime;
        process.queueTime += runTime;
        currentTime += runTime;

        // Add any new arrivals during this run
        processes.forEach(p => {
            if (p !== process && p.arrival <= currentTime && p.remaining > 0 &&
                !queues.some(q => q.includes(p))) {
                queues[0].push(p);
            }
        });

        // Decide where to requeue the process
        if (process.remaining > 0) {
            if (process.quantumUsed >= params.quantum || process.queueTime >= params.allotment) {
                const newQueue = Math.min(3, queueIndex + 1);
                process.queue = newQueue;
                process.quantumUsed = 0;
                process.queueTime = 0;
                queues[newQueue].push(process);
            } else {
                queues[queueIndex].push(process);
            }
        } else {
            process.finishTime = currentTime;
            completed++;
            metrics.push({
                id: process.id,
                arrival: process.arrival,
                burst: process.burst,
                finish: process.finishTime,
                turnaround: process.finishTime - process.arrival,
                waiting: (process.finishTime - process.arrival) - process.burst,
                response: process.responseTime
            });
        }
    }

    return { gantt, metrics };
}
    
    // Updated displayResults with synchronized scrolling
    function displayResults(gantt, metrics) {
        const speedFactor = parseFloat(document.getElementById('animationSpeed').value);
        ganttChart.innerHTML = '';
        metricsTable.querySelector('tbody').innerHTML = '';
        timeLabels.innerHTML = '';

        // Display metrics table
        let totalTurnaround = 0, totalWaiting = 0, totalResponse = 0;
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
        document.getElementById('avgTurnaround').textContent = (totalTurnaround/count).toFixed(2);
        document.getElementById('avgWaiting').textContent = (totalWaiting/count).toFixed(2);
        document.getElementById('avgResponse').textContent = (totalResponse/count).toFixed(2);

        // Create Gantt visualization
        if (gantt.length === 0) {
            ganttChart.innerHTML = '<div class="gantt-block">No processes scheduled</div>';
            return;
        }

        const maxTime = Math.max(...gantt.map(block => block.end));
        const pxPerTimeUnit = 60;
        
        // Create scrollable container
        const ganttContainer = document.createElement('div');
        ganttContainer.className = 'gantt-container';
        ganttContainer.style.width = `${maxTime * pxPerTimeUnit + 100}px`;
        
        // Create time labels row
        const timeLabelRow = document.createElement('div');
        timeLabelRow.className = 'time-label-row';
        timeLabelRow.style.width = `${maxTime * pxPerTimeUnit}px`;
        
        // Create Gantt row
        const ganttRow = document.createElement('div');
        ganttRow.className = 'gantt-row';
        ganttRow.style.width = `${maxTime * pxPerTimeUnit}px`;
        
        // Generate time labels
        for (let t = 0; t <= maxTime; t++) {
            const timeMark = document.createElement('div');
            timeMark.className = 'time-mark';
            timeMark.textContent = t;
            timeMark.style.left = `${t * pxPerTimeUnit}px`;
            timeLabelRow.appendChild(timeMark);
        }
        
        // Create Gantt blocks
        let cumulativeTime = 0;
        gantt.forEach(block => {
            const blockElement = document.createElement('div');
            blockElement.className = `gantt-block queue-${block.queue}`;
            blockElement.innerHTML = `
                <div class="process-id">${block.process}</div>
                <div class="start-time">${block.start}</div>
            `;
            
            blockElement.style.width = '0';
            blockElement.style.left = `${block.start * pxPerTimeUnit}px`;
            ganttRow.appendChild(blockElement);

            const duration = block.end - block.start;
            
    setTimeout(() => {
        blockElement.style.transition = `width ${duration * speedFactor}s linear`;
        blockElement.style.width = `${duration * pxPerTimeUnit}px`;
    }, cumulativeTime * (1000 * speedFactor));
            
            cumulativeTime += duration;
        });

        // Build hierarchy
        ganttContainer.appendChild(timeLabelRow);
        ganttContainer.appendChild(ganttRow);
        ganttChart.appendChild(ganttContainer);

        // Synchronize scrolling
        ganttChart.onscroll = function() {
            timeLabelRow.style.transform = `translateX(-${this.scrollLeft}px)`;
            ganttRow.style.transform = `translateX(-${this.scrollLeft}px)`;
        };
    }
});
