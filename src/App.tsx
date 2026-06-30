import Step0Landing from './steps/Step0Landing'

export default function App() {
  return <Step0Landing onNext={() => alert('Step 1!')} />
}