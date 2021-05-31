namespace MGME.Core.Utils
{
    /*
    A helper class that facilitates passing primitives be reference in async methods

    Thanks to: https://thomaslevesque.com/2014/11/04/passing-parameters-by-reference-to-an-asynchronous-method/
    */
    public class Ref<TValue>
    {
        public TValue Value { get; set; }

        public Ref(TValue value)
        {
            Value = value;
        }

        public override string ToString() => Value == null ? "" : Value.ToString();
    }
}