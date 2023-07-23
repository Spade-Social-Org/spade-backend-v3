import { Job, SandboxedJob, SandboxedJobProcessor } from 'bullmq';

const processor: SandboxedJobProcessor = (
  ...args: Parameters<SandboxedJobProcessor>
) => {
  const job = args[0];
  const doneCallback = args[1];

  console.log(`[${process.pid}] ${JSON.stringify(job.data)}`);

  if (doneCallback) {
    doneCallback(null, 'It works');
  }
};

export default processor;
