// ... (Keep all the imports and state the same)

// Find the handleSubmit function:
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (images.length === 0) { setError('Please upload at least one image'); return; }
    setLoading(true);
    setError(null);

    const payload = { ... }; // Keep payload the same

    const result = isEdit ? await editListing(listingId!, payload) : await createListing(payload);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/seller'); // <-- CHANGED FROM '/dashboard' TO '/seller'
      router.refresh();
    }
  }