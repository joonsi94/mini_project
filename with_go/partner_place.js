document.addEventListener('DOMContentLoaded', async function partnerPlace(){
    const res = await supabase.from('partner_place')
        .select('*')
        .order('partner_id', {ascending: true});

    const $keep_adr_container = document.querySelectorAll('.keep_adr_container');
    const partner_placeData = await res.data.map((item) => {
        return `<div class="keep_adr">
                            <div class="keep_adr_infor">
                                <p class="title">${item.name}</p>
                                <p class="location">${item.address}</p>
                            </div>
                            <a href="partner_details.html?id=${item.partner_id}"
                               onclick="window.open(this.href, '_blank', 'width=800, height=650'); return false;">상세보기</a>
                        </div>
                        `;
    }).join('');

    const $partner_input = document.getElementById('partner_input');

    async function partnerSearch() {
        const res = await supabase.from('partner_place')
            .select('*')
            .ilike('name', `%${$partner_input.value}%`)
            .order('partner_id', {ascending: true});

        const partner_placeSearchData = await res.data.map((item) => {
            return `<div class="keep_adr">
                            <div class="keep_adr_infor">
                                <p class="title">${item.name}</p>
                                <p class="location">${item.address}</p>
                            </div>
                            <a href="partner_details.html?id=${item.partner_id}"
                               onclick="window.open(this.href, '_blank', 'width=800, height=650'); return false;">상세보기</a>
                        </div>
                        `;
        }).join('');

        $keep_adr_container[1].innerHTML = partner_placeSearchData;

        if ($partner_input.value === '') {
            partnerPlace();
        }
        if (res.data.length === 0) {
            const $noData = `<div style="margin: auto">데이터가없습니다.</div>`
            $keep_adr_container[1].innerHTML = $noData;
        }
    }

    document.getElementById('partner_search').addEventListener('click', partnerSearch);
    $partner_input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            partnerSearch();
        }
    })

    $keep_adr_container[1].innerHTML = partner_placeData;
})
