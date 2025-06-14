document.addEventListener('DOMContentLoaded', async function storagePlace(){
    const res = await supabase.from('storage_place')
        .select('*')
        .order('storage_id', {ascending: true});

    const $keep_adr_container = document.querySelectorAll('.keep_adr_container');
    const storage_placeData = await res.data.map((item) => {
        return `<div class="keep_adr">
                            <div class="keep_adr_infor">
                                <p class="title">${item.name}</p>
                                <p class="location">${item.address}</p>
                            </div>
                            <a href="storage_details.html?id=${item.storage_id}"
                               onclick="window.open(this.href, '_blank', 'width=800, height=650'); return false;">상세보기</a>
                        </div>
                        `;
    }).join('');

    const $storage_input = document.getElementById('storage_input');

    async function storageSearch() {
        const res = await supabase.from('storage_place')
            .select('*')
            .ilike('name', `%${$storage_input.value}%`)
            .order('storage_id', {ascending: true});
        console.log(res.data);

        const storage_placeSearchData = await res.data.map((item) => {
            return `<div class="keep_adr">
                            <div class="keep_adr_infor">
                                <p class="title">${item.name}</p>
                                <p class="location">${item.address}</p>
                            </div>
                            <a href="storage_details.html?id=${item.storage_id}"
                               onclick="window.open(this.href, '_blank', 'width=800, height=650'); return false;">상세보기</a>
                        </div>
                        `;
        }).join('');

        $keep_adr_container[0].innerHTML = storage_placeSearchData;

        if ($storage_input.value === '') {
            storagePlace();
        }
        if (res.data.length === 0) {
            const $noData = `<div style="margin: auto">데이터가없습니다.</div>`
            $keep_adr_container[0].innerHTML = $noData;
        }
    }

    document.getElementById('storage_search').addEventListener('click', storageSearch);
    $storage_input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            storageSearch();
        }
    })

    $keep_adr_container[0].innerHTML = storage_placeData;
})
